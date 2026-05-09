terraform {
  backend "s3" {
    # Replace these with the values printed by `terraform output` in infra/bootstrap.
    bucket         = "REPLACE_WITH_state_bucket_OUTPUT"
    key            = "weather/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "weather-tf-lock"
    encrypt        = true
  }
}
