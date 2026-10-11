# Daniel's Birthday Wishlist

Friends open the site, pick a gift, enter a name (or stay anonymous) and book it. A booked gift shows as taken for everyone, so nobody buys the same thing twice. No sign-in needed.

- `public/` is the website. Gifts, notes, links and photos live in `public/items.js`.
- `netlify/functions/` stores bookings in Netlify Blobs.
- `/admin` shows who booked what. It needs the `ADMIN_PIN` environment variable set in Netlify.

## Deploy on Netlify

1. Netlify: **Add new site → Import an existing project → GitHub →** pick this repo. Leave the build settings as they are (they come from `netlify.toml`).
2. Before deploying, add an environment variable `ADMIN_PIN` with the PIN you want for `/admin`.
3. Deploy. Rename the site under **Site configuration → Change site name** to get a short link like `daniel-bday.netlify.app`.
