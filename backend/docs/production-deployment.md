# Nuturemite Production Deployment Guide

## PhonePe Production Integration

### Configuration

1. Update the `.env` file with production credentials:

```properties
# PhonePe Credentials - Production
PHONEPE_API_KEY=6867369a-26d1-4748-94de-bdc7a1013bf8
PHONEPE_MERCHANT_ID=M228EY1054QWH
PHONEPE_CLIENT_ID=M228EY1054QWH_25042
PHONEPE_CLIENT_SECRET=NDczOGjYzUtNWI3Zi00ZTUMDVIZjc1MDU1ZjAy
PHONEPE_WEBHOOK_SECRET=webhook_secret_here
PHONEPE_ENVIRONMENT=production
```

2. Ensure you also update frontend URLs to match your production domain:

```properties
ORIGIN=https://yourdomain.com
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### Starting the Backend in Production Mode

**Option 1: Using npm script**
```bash
npm run prod
```

**Option 2: Using Windows batch file**
```bash
start-prod.cmd
```

**Option 3: Setting environment variables manually**
```bash
# For Unix/Linux/macOS
NODE_ENV=production PHONEPE_ENVIRONMENT=production node index.js

# For Windows PowerShell
$env:NODE_ENV="production"; $env:PHONEPE_ENVIRONMENT="production"; node index.js

# For Windows Command Prompt
set NODE_ENV=production && set PHONEPE_ENVIRONMENT=production && node index.js
```

### Verifying Production Configuration

To verify the PhonePe configuration is set correctly for production:

```bash
node tools/test-phonepe-config.js
```

Look for `Environment: PRODUCTION` and `API URL: https://api.phonepe.com/apis/hermes` in the output.

### Testing the Production Integration

1. Make a small test purchase on your live site
2. Check that you're redirected to the PhonePe production payment page (URL should be `https://pay.phonepe.com/...`)
3. Complete the payment with a test card
4. Verify you're redirected back to your site with the correct payment status

### PhonePe Production Dashboard

Monitor your transactions through the PhonePe Merchant Dashboard:
- URL: https://dashboard.phonepe.com/
- Login with your production merchant credentials

### Support Contacts

If you encounter any issues with the PhonePe production integration, contact:
- PhonePe Merchant Support: https://www.phonepe.com/contact-us/
- Your PhonePe account manager
