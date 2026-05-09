variable "region" {
  type        = string
  default     = "eu-central-1"
  description = "AWS region for the state bucket and lock table."
}

variable "state_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for Terraform state."
}

variable "lock_table_name" {
  type        = string
  default     = "weather-tf-lock"
  description = "DynamoDB table name for Terraform state locks."
}

variable "github_repo" {
  type        = string
  default     = "fimichiq/devops-weatherapp"
  description = "GitHub repo allowed to assume the CI role via OIDC, in OWNER/REPO form."
}

variable "ci_role_name" {
  type        = string
  default     = "github-actions-weather"
  description = "Name of the IAM role assumed by GitHub Actions."
}
