output "state_bucket" {
  value       = aws_s3_bucket.tfstate.bucket
  description = "S3 bucket name to put in infra/backend.tf."
}

output "lock_table" {
  value       = aws_dynamodb_table.tflock.name
  description = "DynamoDB table name to put in infra/backend.tf."
}

output "region" {
  value       = var.region
  description = "Region to put in infra/backend.tf."
}

output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "Set this as the AWS_ROLE_ARN repo variable in GitHub Actions."
}

output "account_id" {
  value       = data.aws_caller_identity.current.account_id
  description = "Set this as the AWS_ACCOUNT_ID repo variable for ECR image URLs."
}
