What You Need

Before running the app, make sure the following are already installed on your computer:

Node.js (preferably LTS version)

Expo CLI

A code editor like Visual Studio Code

Expo Go app (on your mobile device for testing)

How to Run the App
Step 1: Open the Project

Extract or open the ShopEZ project folder on your computer.

Open the folder using your code editor (e.g., Visual Studio Code).

Step 2: Install Dependencies (if needed)

If dependencies are not yet installed, open the terminal inside the project folder and run:

npm install

This will install all required packages listed in package.json.

Step 3: Start the App

To start the project, run the following command in the terminal:

npx expo start

This will open Expo Developer Tools in your web browser.

You will see a QR code for testing on a mobile device.

You can scan the QR code using the Expo Go app on your phone (available on iOS and Android).

Alternatively, you can run the app on an Android or iOS emulator if it's already set up on your computer.

Firebase Setup

Firebase is already configured in the project.

The Firebase configuration is located in the file:

firebase.js

The app uses:

Firebase Authentication with Email/Password

Firebase Realtime Database to store user cart data

Firebase Database Rules

To ensure each user can only access their own cart data, the following Firebase Realtime Database rules should be applied:

{
  "rules": {
    "carts": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}


These rules ensure data privacy and user-based access control.

Screens to Test

Please test the following screens:

Login and Registration

Product List (fetched from Fake Store API)

Product Detail (with “Add to Cart”)

Cart (saves data per user in Firebase)

Cart data is synced in real time and also stored locally for offline use.

No Additional Configuration Needed

Once the app is running using npx expo start, everything should work as expected. Firebase is already connected, and the Fake Store API is used for products.
