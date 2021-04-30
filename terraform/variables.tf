# Environment variables used to control the deployment.
# Edit these values as appropriate, then 'source setup.sh' to set the environment variables
# in your current login session.

# Enter your subscription ID.
# Available from Agile Central. Login as a subscription admin.
variable "RALLY_SUBSCRIPTION_ID" {
    type    =   string
    description = "Rally Subscription ID"
}

# Workspace to monitor webhook changes
variable "WEBHOOK_RALLY_WORKSPACE_UUID"{
    type    =   string
    description = "Workspace to monitor the webhook changes"
}


# Enter an API key for a user that has edit access to all projects in the workspace
variable "RALLY_API_KEY"{
    type = string
    description = "API key to edit all projects"
}

# Enter an API key for a user that has workspace admin
variable "WEBHOOK_RALLY_API_KEY"{
    type = string
    description = "User for workspace admin"
}

# Set this to any random alpha-numerical value. Webhooks will listen for requests that include
# this value as part of the URL.
# Only the webhooks created by this package will know this path value. No on else is
# likely to be able to guess this URL and abuse the webhook listeners.
variable "WEBHOOK_LISTENER_PATH"{
    type = string
    description = "Webhooks to listen to this part of the uRL"
}

# AFTER running `npm run deploy`, enter the value of the `POST` output
variable "WEBHOOK_TARGET_URL"{
    type = string
    description = "Lambda url that is needed for configuring the webhooks"
}
