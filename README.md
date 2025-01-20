# Discord&LINE 連携BOT
## Usage
1. 
```bash
git clone https://github.com/Knakar/Discord-and-LINE-connection-bot.git
cd Discord-and-LINE-connection-bot/
```
2. 
```bash
npm install
touch .env
```
3. 
edit `.env` file
```.env
DISCORD_API_TOKEN="<DISCORD API TOKEN>"
DISCORD_WEBHOOK_URL="<DISCORD WEBHOOK URL>"
LINE_API_TOKEN="<LINE Messageing API CHANNEL ACCESS KEY>"
LINE_WEBHOOK_SECRETKEY="<LINE CHANNNEL SECRET>"
```
4.
```bash
PORT="<SERVER LISTENING PORT>" npx tsx src/app.ts
```
## User Mannual
[ユーザーマニュアル(Notion.site)](https://glacier-rainforest-de8.notion.site/Discord-Line-Bot-17c17e376dd780df8f44ed06e811df7a?pvs=4)

## 開発の背景&目的
所属しているサークルでは、連絡ツールとして [Discord](https://discord.com/) を利用して情報を集約している。しかし、Discordを日常的に利用しない部員に対して連絡が届きにくい、または届かないという問題が発生していた。この問題を解決するため、Discordでの全体連絡を公式LINEに転送する仕組みを構築した。

さらに、新歓時には新入生との連絡手段が確立されていなかったため、LINEを用いて連絡を取れるようにした。この際、Discord上でも個別連絡が可能となるよう対応を行った。これにより、SNSを管理している幹部だけでなく、他の幹部も新入生からのメッセージに対応可能となり、幹部間でのやり取りの状況を把握できるようになった。

以上の取り組みにより、サークル内の連絡体制を効率化し、情報共有の円滑化を図った。
