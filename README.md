# Pydantic Errors Redirect

[![CI](https://github.com/pydantic/pydantic-errors-redirect/workflows/CI/badge.svg?event=push)](https://github.com/pydantic/pydantic-errors-redirect/actions?query=event%3Apush+branch%3Amain+workflow%3ACI)

Redirects for URLs shown in errors, implemented using CloudFlare workers.

**Warning: deploy is triggered by push to main branch.**

Example redirect

```
https://errors.pydantic.dev/v2.0a3/u/decorator-missing-field
 ->
https://docs.pydantic.dev/usage/errors/#decorator-missing-field
```
