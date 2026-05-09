resource "aws_ssm_parameter" "meteosource_api_key" {
  name        = "/weather/meteosource_api_key"
  type        = "SecureString"
  value       = "PLACEHOLDER_PUT_REAL_KEY_VIA_AWS_CLI"
  description = "Meteosource API key for the backend. Real value set out-of-band via 'aws ssm put-parameter --overwrite'."

  lifecycle {
    ignore_changes = [value]
  }
}
