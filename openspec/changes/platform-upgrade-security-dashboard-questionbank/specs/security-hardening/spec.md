## ADDED Requirements

### Requirement: Secrets loaded from environment variables
The system SHALL load all sensitive configuration (SECRET_KEY, VNPAY credentials) from environment variables via `os.getenv()` with `python-dotenv`, NOT from hardcoded values in source code.

#### Scenario: SECRET_KEY loaded from env
- **WHEN** the backend starts
- **THEN** `security.py` SHALL read `SECRET_KEY` from `os.getenv("SECRET_KEY")` with a development fallback value

#### Scenario: VNPAY credentials loaded from settings
- **WHEN** a payment URL is created or IPN is processed
- **THEN** `payment.py` SHALL use `settings.VNPAY_TMN_CODE`, `settings.VNPAY_HASH_SECRET`, `settings.VNPAY_PAYMENT_URL`, `settings.VNPAY_RETURN_URL` from `config.py` instead of hardcoded values

### Requirement: Environment example file exists
The system SHALL include a `.env.example` file with all required environment variable names and placeholder values for developer onboarding.

#### Scenario: New developer setup
- **WHEN** a new developer clones the repository
- **THEN** they can copy `.env.example` to `.env` and fill in their own values

### Requirement: Gitignore protects secrets
The project SHALL have a `.gitignore` file that excludes `.env`, `__pycache__/`, `node_modules/`, and other sensitive/generated files.

#### Scenario: Secrets not committed
- **WHEN** a developer runs `git add .`
- **THEN** `.env` files SHALL NOT be staged for commit
