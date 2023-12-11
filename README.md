# Bsky-block


App to block all russian account is bsky.

This app utilize public API to scrape data about users (actors) and posts.

### Setup
1. Clone .env.example to .env
2. Fill data in .env file
3. Run command `npm install`
4. Run command `npm run build` to create new build
5. Run command `npm run dev` to start application

The app use PostgreSQL as database. With few twicks you can change it to any relational database if you want.

### Roadmap
- [x] Synchronization users and followers
- [x] Synchronization latest user posts (up to 100 per user)
- [ ] NLP posts analysis to define primary language of users
- [ ] Creating moderation list
- [ ] Automatic block all users from russia

## Bugs
- [ ] Some users (actors) has posts with same url as other user

- [ ] Some users (actors) has no followers. It's brake the script.

- [ ] Performance is quite slow. ~100_000 synced users per hour (CPU: Ryzen 5 3600, RAM: 32gb 3200mhz, SSD)
