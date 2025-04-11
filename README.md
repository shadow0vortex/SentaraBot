# 🤖 SentaraBot

**SentaraBot** is an AI-based Discord moderation bot designed to maintain peace and order in your server. It monitors offensive messages, logs violations, and enforces server rules with automatic user suspensions after repeated offenses. Built with Node.js and PostgreSQL.

---

## 🛡️ Features

- 🚨 Detects **cuss words**, **abusive language**, and **rule violations**
- 📚 Logs all offenses with **username, content, and timestamp**
- ⛔ Automatically **suspends users** after 3 offenses
- 🧠 Uses **PostgreSQL** to store offense and suspension history
- 🔐 Admin-only slash command to:
  - View offense history
  - Unsuspend users manually

---

## 📂 Project Structure

SentaraBot/ 
├── .env 
├── .gitignore 
├── index.js 
├── package.json 
├── package-lock.json 
├── commands/ 
│ └── offenses.js 
│ └── unsuspend.js 
├── controllers/ 
│ └── offensecontroller.js 
├── db/ 
│ └── db.js 
├── utils/


---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/shadow0vortex/SentaraBot.git
cd SentaraBot


