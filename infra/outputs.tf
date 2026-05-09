output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "Public DNS of the ALB. Open http://<this>/ in a browser."
}

output "alb_url" {
  value       = "http://${aws_lb.main.dns_name}"
  description = "Convenience URL."
}

output "ecr_backend_url" {
  value       = aws_ecr_repository.backend.repository_url
  description = "ECR repo URL for the backend image (use in CI workflow)."
}

output "ecr_frontend_url" {
  value       = aws_ecr_repository.frontend.repository_url
  description = "ECR repo URL for the frontend image (use in CI workflow)."
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster name (use in 'aws ecs update-service ...' from CI)."
}

output "account_id" {
  value       = data.aws_caller_identity.current.account_id
  description = "AWS account id (set as AWS_ACCOUNT_ID repo variable)."
}
