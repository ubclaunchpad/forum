import { ProfileWithoutId } from "@shared/mod.ts";
import { userController } from "../users/controller.ts";
import { supa } from "../_shared/db.ts";


const authUsers = [
    {
        email: "admin@test.com",
        password: "Test123!",
    },
    {
        email: "user@test.com",
        password: "Test123!",
    },
    {
        email: "user2@test.com",
        password: "Test123!",
    },
]

const profiles: ProfileWithoutId[] = [
    {
        first_name: "Admin",
        last_name: "Test",
        email: "admin@test.com",
        username: "admin",
        display_name: "Admin Test",
        pronouns: "he/him",
        avatar_url: "https://example.com/avatar.png",
        bio: "I am an admin",
        social_links: [],
    },
    {
        first_name: "User",
        last_name: "Test",
        email: "user@test.com",
        username: "user",
        display_name: "User Test",
        pronouns: "he/him",
        avatar_url: "https://example.com/avatar.png",
        bio: "I am a user",
        social_links: [],
        
    },
   
    {
        first_name: "User",
        last_name: "Test",
        email: "user2@test.com",
        username: "user2",
        display_name: "User Test 2",
    },
]



/**
 * This file is used to setup the database for development purposes.
 * It is gitignored so it is not committed to the repo.
 * When you run e2e tests, your database will be reset. 
 * This file will be used to reset and fill the database with any data you need that would take the pain of redoing it every time.
 */
async function setupDevSeedData() {
    console.log("Setting up dev seed data")
    await emptyDatabase()
    console.log("Database emptied")

    const {data: image_url} = await supa.storage.from("images").getPublicUrl("defaults/default1.png")
    const users = []

    for (let i = 0; i < authUsers.length; i++) {
        const user = authUsers[i]
        const result = await userController.createUserViaEmailPassword({
            email: user.email,
            password: user.password,
        })

        users.push(result)
    }

    console.log("Users created:", users)

    for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i]
        const profileWithImage = {
            ...profile,
            avatar_url: image_url.publicUrl,
        }
        await userController.approveUserAccount(users[i].id)
        await userController.activateAccountAndProfile(users[i].id, profileWithImage)
        const status = await userController.getUserAccountStatus(users[i].id)
        console.log("Status:", status)
    }

    console.log("Profiles created:", profiles)    

    

    await userController.makeUserAdmin(users[0].id)

    console.log("Database setup complete")
}


async function emptyDatabase() {
    await supa.from("profiles").delete()
    await supa.from("account_status").delete()
    await supa.from("admin_users").delete()
    const users = await supa.auth.admin.listUsers()
    for (const user of users.data.users) {
        await supa.auth.admin.deleteUser(user.id)
    }
}

emptyDatabase()
setupDevSeedData()