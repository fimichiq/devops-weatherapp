# infra/

Terraform for the weather app on AWS: VPC, ALB, ECS Fargate (backend + frontend), ECR, CloudWatch logs, SSM secret. Region: `eu-central-1`. State: S3 + DynamoDB lock.

## Layout

```
infra/
├── bootstrap/    # one-time: state bucket, lock table, GitHub OIDC, CI role
└── *.tf          # main stack: VPC, ALB, ECS, ECR, IAM, SSM, logs
```

## First-time setup

### 1. Bootstrap (run once, local state)

```bash
cd infra/bootstrap
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars and set a globally-unique state_bucket_name
terraform init
terraform apply
```

Note the outputs — they are needed in the next step:

```
state_bucket            = "weather-tfstate-..."
lock_table              = "weather-tf-lock"
github_actions_role_arn = "arn:aws:iam::123456789012:role/github-actions-weather"
account_id              = "123456789012"
```

### 2. Wire up the main stack's S3 backend

Edit [backend.tf](backend.tf) and replace `REPLACE_WITH_state_bucket_OUTPUT` with the `state_bucket` output from bootstrap.

### 3. Apply the main stack

```bash
cd infra
terraform init
terraform apply
```

This creates the VPC, ALB, ECR repos, ECS cluster + services, etc. ECS services will fail to start until images exist in ECR — that is expected at this point.

### 4. Set the real Meteosource API key

Terraform creates the SSM parameter with a placeholder value and ignores changes thereafter. Put the real key:

```bash
aws ssm put-parameter \
  --name /weather/meteosource_api_key \
  --value '<your-real-key>' \
  --type SecureString \
  --overwrite \
  --region eu-central-1
```

### 5. Configure GitHub Actions to push to ECR

Set repo variables (not secrets — these aren't sensitive):

```bash
gh variable set AWS_ROLE_ARN --body "$(terraform -chdir=bootstrap output -raw github_actions_role_arn)"
gh variable set AWS_ACCOUNT_ID --body "$(terraform -chdir=bootstrap output -raw account_id)"
gh variable set AWS_REGION --body "eu-central-1"
```

Push to `master` (or merge a PR) — `ci-backend` and `ci-frontend` will build images and push them to ECR, then force a new ECS deployment.

### 6. Verify

```bash
terraform output alb_url        # http://weather-alb-xxxxx.eu-central-1.elb.amazonaws.com
curl -i "$(terraform output -raw alb_url)/api/weather?city=berlin"
open "$(terraform output -raw alb_url)"
```

ECS service health: AWS Console → ECS → `weather-cluster` → both services should show `Running tasks = 1` and target groups `healthy`.

## Day-to-day

- **Deploy a new image**: push to `master`. CI builds, pushes `:latest` and `:sha-<short>`, then runs `aws ecs update-service --force-new-deployment`. Task definition is unchanged (still references `:latest`); ECS pulls the new image.
- **Change task CPU/memory or env**: edit [ecs.tf](ecs.tf), `terraform apply`. The `lifecycle.ignore_changes = [task_definition]` on services means Terraform won't fight CI-driven deploys, but it also means changes to the task def via Terraform won't propagate to running tasks unless you also bump `desired_count` or run `aws ecs update-service --force-new-deployment` afterwards.
- **Inspect logs**: AWS Console → CloudWatch → Log groups → `/ecs/weather-backend` or `/ecs/weather-frontend`.

## Cost estimate (eu-central-1, on-demand)

- ALB: ~16 USD/month
- 2× Fargate task (256 CPU / 512 MB): ~9 USD/month each
- NAT Gateway: **0** (tasks run in public subnets)
- ECR storage: pennies for ~10 images each
- CloudWatch logs: pennies at this volume
- SSM Standard parameter: free

Roughly **~35 USD/month** if both services run 24/7. Stop them with `terraform apply -var='desired_count=0'` (would require parameterizing) or by scaling services to 0 in the console.

## Teardown

```bash
cd infra
terraform destroy
cd bootstrap
terraform destroy   # bucket must be emptied first if versioning created versions
```
