# Environment variables used to control the deployment.
# Edit these values as appropriate, then 'source setup.sh' to set the environment variables
# in your current login session.

# Enter your subscription ID.
# Available from Agile Central. Login as a subscription admin.
# Click `Setup` icon, then `Subscription` tab. Example: `12345`
# export RALLY_SUBSCRIPTION_ID=59351
export TF_VAR_RALLY_SUBSCRIPTION_ID=59351

# UUID of the workspace to monitor using the webhook. To get this from Agile Central:
# 1. System Administration -> Workspaces & Projects
# 2. Select a workspace
# 3. Copy the last part of the URL (Example: `https://rally1.rallydev.com/#/161648491828/detail/workspace/154332795024` ). Here, `154332795024` is the workspace ID
# 4. Open a tab to `https://rally1.rallydev.com/slm/webservice/v2.0/workspace/<workspaceId>`. (Example: `https://rally1.rallydev.com/slm/webservice/v2.0/workspace/154332795024`).
# 5. Find the `ObjectUUID` value.  (Example: `213c5e3e-1c86-49e4-bff0-9ceadda`)

# This is the production UUID
#export WEBHOOK_RALLY_WORKSPACE_UUID=b475cff6-a00b-4cec-9a29-ca2eaba81e04
# This is the Training UUID
export TF_VAR_WEBHOOK_RALLY_WORKSPACE_UUID=8fe6f2f2-7a83-43f6-ac30-29cef4f8f1b2
# DO NOT LEAVE BOTH UNCOMMENTED

# Enter an API key for a user that has edit access to all projects in the workspace
export TF_VAR_RALLY_API_KEY=_CypYmrgpRGElYBCjZ4g3uwRwYwqkUqloGBDNsEWJs

# Enter an API key for a user that has workspace admin
export TF_VAR_WEBHOOK_RALLY_API_KEY=_CypYmrgpRGElYBCjZ4g3uwRwYwqkUqloGBDNsEWJs

# Set this to any random alpha-numerical value. Webhooks will listen for requests that include
# this value as part of the URL.
# Only the webhooks created by this package will know this path value. No on else is
# likely to be able to guess this URL and abuse the webhook listeners.
export TF_VAR_WEBHOOK_LISTENER_PATH="3277c954-e5fb-11e7-80c1-9a914cz093ae"

# AFTER running `npm run deploy`, enter the value of the `POST` output
export TF_VAR_WEBHOOK_TARGET_URL=https://o8fki03ts0.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3

# If NOT running in Cloud9, uncomment below and add your AWS access key value
#export AWS_ACCESS_KEY=

# If NOT running in Cloud9, uncomment below and add your AWS access key value
#export AWS_SECRET_ACCESS_KEY=


#export AWS_ROLE_LAMBDA_DEV=arn:aws:iam::191922881076:role/deployLambdaTerminal

export AWS_ACCESS_KEY_ID=ASIAQWFZDSISXZCHHWAD
export AWS_SECRET_ACCESS_KEY=2OytgfNuYyq6jY3bjL2wRMEMe+SpaFJM9ONVM+EJ
export AWS_SESSION_TOKEN=FwoGZXIvYXdzEBUaDKIWfWcqLD/Bylqb4CKsAQtEEsZiWL9fSkS6MKqF/4j+wtaWhvceQh8IX2syBkidoSSbOTKjgtHBPUOxMYoCdXBHHIVusFNE4kvdvgjgPa6p8HEhrPgBgVeFBM2YnMsHbhuKuMxV+R43CsXHNw8ISi9ECTfoYkQNNxYgjM/LDTyaBNbWkmOPHpmxdBsA0R7eX+zlavLg0vpnp9lVo/IZN7FIhkZmSRJgm0sRVI5f4s+8jJ3/I+IaS/VlGcYol4yshAYyLTAbiDPKTdd8xcZhcdOuL67nuy+Nvlgy8f5Xddj//KrBC5jX6eU0Zuud4xF+2w==
export AWS_DEFAULT_REGION=us-east-1