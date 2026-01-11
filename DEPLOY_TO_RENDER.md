# Deploying OrlitERP to Render.com

This guide will help you deploy your application to the cloud for free using Render.com.

## ✅ Prerequisites

1.  **GitHub Account:** You need to have your code pushed to a GitHub repository.
2.  **Render Account:** Sign up at [render.com](https://render.com).

## 🚀 Deployment Steps

1.  **Log in to Render Dashboard.**
2.  Click the **New +** button in the top right corner.
3.  Select **Blueprint**.
4.  Connect your GitHub repository (you might need to grant permissions).
5.  Select your **OrlitERP** repository from the list.
6.  Render will automatically detect the `render.yaml` file.
7.  Click **Apply** or **Create Blueprint**.

## ⏳ What happens next?

Render will automatically create:
*   A **Database** (PostgreSQL).
*   A **Backend Service**.
*   A **Frontend Service**.

The deployment process will take about **5-10 minutes**.

## 🌍 Accessing your App

Once the deployment shows "Service Live":
1.  Click on the **orliterp-frontend** service in your dashboard.
2.  You will see a URL at the top (e.g., `https://orliterp-frontend-xxxx.onrender.com`).
3.  Click that link to access your application!

> [!NOTE]
> **Free Tier Limitation:** If you don't use the app for a while, Render will put the server to "sleep". When you come back, the first request might take **30-60 seconds** to load while it wakes up. This is normal for the free plan.
