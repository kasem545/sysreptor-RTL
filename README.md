<h1 align="center">
    <br>
    <a href="https://docs.sysreptor.com/"><img src="/docs/docs/public/assets/dino/banner.svg" width="100%" alt="SysReptor"></a>
</h1>

<h4 align="center">An easy and customizable pentest reporting platform for security professionals.</h4>

<div align="center">
    
[![GitHub stars](https://img.shields.io/github/stars/Syslifters/sysreptor?color=yellow&style=flat-square)](https://github.com/syslifters/sysreptor/)
[![Release](https://img.shields.io/github/v/release/syslifters/sysreptor?color=green&style=flat-square)](https://github.com/syslifters/sysreptor/releases/latest)
[![Release date](https://img.shields.io/github/release-date/syslifters/sysreptor?color=blue&style=flat-square)](https://github.com/syslifters/sysreptor/releases/latest)
[![Repo size](https://img.shields.io/github/repo-size/syslifters/sysreptor?color=red&style=flat-square)](https://github.com/syslifters/sysreptor/releases/latest)
[![LinkedIn](https://img.shields.io/badge/-Linkedin-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/showcase/sysreptor/)
[![Twitter](https://img.shields.io/twitter/follow/sysreptor?style=social)](https://twitter.com/intent/user?screen_name=sysreptor)
[![Ask DeepWiki](https://img.shields.io/badge/Ask-DeepWiki-1fa669?style=flat&colorA=080f12&colorB=1fa669)](https://deepwiki.com/syslifters/sysreptor)

</div>

<div align="center">

[Playground](https://sysreptor.com/demo) •
[Ideas](https://github.com/Syslifters/sysreptor/discussions/categories/ideas) •
[Questions](https://github.com/Syslifters/sysreptor/discussions/categories/q-a) •
[Documentation](https://docs.sysreptor.com/) •
[Features and Pricing](https://sysreptor.com/pricing) •
[Installation](https://docs.sysreptor.com/setup/installation/) •
[Buy SysReptor](https://portal.sysreptor.com/order/)

</div>

---

SysReptor is a fully customizable pentest reporting platform designed for penetration testers, red teamers, and other cybersecurity professionals.<br><br>

🎨 Design your report in HTML.<br>
✍️ Write it in Markdown.<br>
📄 Render to PDF.<br>
🌍 Right-to-left languages (Arabic, Hebrew).<br>
☁️ Self-hosted or Cloud.<br>

<h3 align="center">
    <a href="https://sysreptor.com/demo"><img src="/docs/docs/public/assets/dino/sign_demo.svg" width="15%" alt="Demo"></a>
</h3>
<h3 align="center">🦖 Try the <a class="md-button" href="https://sysreptor.com/demo/">Playground</a></h3>

<br>

## Getting started

* [Install SysReptor](https://docs.sysreptor.com/setup/installation/)
* [Check out some demo reports](https://docs.sysreptor.com/demo-reports/)
* [Get involved](https://docs.sysreptor.com/get-involved/)
* ⭐ Leave a star? 💚

### Build the image

```bash
docker build -t syslifters/sysreptor:local .
```

The deploy stack references `syslifters/sysreptor:${SYSREPTOR_VERSION}`, so tagging your build as `syslifters/sysreptor:local`
lets you use it by setting one variable, without changing the compose files.

### Configure and start

```bash
cd deploy
cp .env.example .env
cp app.env.example app.env

# Generate secrets
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(48))" >> app.env
KEY=$(head -c 32 /dev/urandom | base64)
echo "ENCRYPTION_KEYS='[{\"id\": \"key-1\", \"key\": \"$KEY\", \"cipher\": \"AES-GCM\", \"revoked\": false}]'" >> app.env
echo 'DEFAULT_ENCRYPTION_KEY_ID=key-1' >> app.env

# Use your locally built image
sed -i 's/^# SYSREPTOR_VERSION=.*/SYSREPTOR_VERSION=local/' .env

docker compose up -d
curl -f http://localhost:8000/api/public/utils/healthcheck/
```

By default the app listens on `127.0.0.1:8000`. Change `BIND_PORT` in `.env` to expose it on other addresses or ports,
and see `app.env` for more settings (plugins, allowed hosts, etc.).

### Create an admin user

These are the login credentials for `http://localhost:8000` — there are no default credentials:

```bash
docker compose exec app python3 manage.py createorupdateuser --username admin --password <password> --superuser  # min. 15 characters
```

### Create a user

```bash
docker compose exec app python3 manage.py createorupdateuser --username sysreptor --password <password>
```

Forgot the password? Re-run the same command with a new password to reset it.

<br>
The FFG is the central national funding organization and strengthens Austria's innovative power.<br>
This project is funded by the FFG.<a href="https://www.ffg.at" target="_blank">www.ffg.at</a>
