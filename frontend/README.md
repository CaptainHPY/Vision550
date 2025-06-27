## Getting Started On Frontend

1. Install bun: [https://bun.sh/](https://bun.sh/)

2. Install dependencies:

```bash
cd frontend
bun i
```

3. Create a Neon account and a new project: [https://neon.tech/](https://neon.tech/)

4. Copy the connection string from the Neon project and paste it into the `.env` file in the `frontend` folder: 

```
DATABASE_URL=
```

5. Generate an AUTH_SECRET using `openssl rand -hex 32` and paste it into the `.env` file:

```
AUTH_SECRET=
```

6. Create a Cloudinary account and a new project: [https://cloudinary.com/](https://cloudinary.com/)

7. Copy the configs from the Cloudinary project and paste it into the `.env` file:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

8. Run the development server:

```bash
bun dev
```

9. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
