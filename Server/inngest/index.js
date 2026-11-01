import { Inngest } from "inngest";
import User from "../models/User.js";
                  
export const inngest = new Inngest({ id: "Glairit-Socially-app" });

const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
        event: 'clerk/user.created'
    },
    async ({event})=>{
        const { id, first_name, last_name, email_addresses, image_url} = event.data
        
        const primaryEmail = email_addresses && email_addresses.length > 0 
            ? email_addresses[0].email_address 
            : `user_${id}@glairit.com`;

        let username = primaryEmail.split('@')[0]
    
        let isUnique = false;
        let attempts = 0;
    
        while(!isUnique && attempts < 5){    
            const existingUser = await User.findOne({username})
            if(existingUser){
                username = `${username}${Math.floor(1000 + Math.random() * 9000)}`
                attempts++;
            } else {
                isUnique = true;
            }
        }
        const userData ={
            _id: id,
            email: primaryEmail,
            full_name: `${first_name || " "} ${last_name || ''}`.trim(),
            profile_picture: image_url,
            username
        }
        await User.findByIdAndUpdate(id, userData, {upsert: true, new: true})
    }
)

const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
        event: 'clerk/user.updated'
    },
    async ({event})=>{
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        
        const updatedUserData = {
                email: email_addresses[0].email_address,
                full_name: `${first_name || " "} ${last_name || ''}`.trim(),
                profile_picture: image_url
        }

        if(email_addresses && email_addresses.length > 0){
            updatedUserData.email = email_addresses[0].email_address
        }
        
        await User.findByIdAndUpdate(id, updatedUserData)
    }
)

const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-from-clerk',
        event: 'clerk/user.deleted'
    },
    async ({event})=>{
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)

// Inngest functions for user creation, updation, and deletion are defined above. These functions to send reminder when  new connection request is added.
 const sendNewConnectionRequestReminder = inngest.createFunction(
    {
        id: 'send-new-connection-request-reminder',
        event: 'app/connection-request'
    },
    async ({event}) => {
        const {connectionId} = event.data
        await step.run('send-connection-request-mail', async () =>{
            const connection = await Connection.findById(connectionId).populate('from_user_id', 'full_name email').populate('from_user_id','to_user_id')
            const subject = 'New Connection Request'
            const body = 
            `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>HI ${connection.to_user_id.full_name},</h2>
                <p>You have received a new connection request from ${connection.from_user_id.full_name} - ${connection.from_user_id.username}.</p>
                <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here</a> to accept or reject the request.</p>
                <br />
                <p>Thanks,<br/>Glairit-Socially</p>
            </div>`
            await sendEmail({to: connection.to_user_id.email, subject, body})
        })
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000); 
        await step.sleepUntil("wait-for-24-hours", in24Hours)
        await step.run('send-connection-request-reminder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id', 'full_name email').populate('from_user_id','to_user_id')    
            if(connection.status === 'accepted'){
                return {message: "Already accepted, no need to send reminder"}
            }
          const subject = 'New Connection Request'
            const body = 
            `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>HI ${connection.to_user_id.full_name},</h2>
                <p>You have received a new connection request from ${connection.from_user_id.full_name} - ${connection.from_user_id.username}.</p>
                <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here</a> to accept or reject the request.</p>
                <br />
                <p>Thanks,<br/>Glairit-Socially</p>
            </div>`
            await sendEmail({to: connection.to_user_id.email, subject, body})
        }) 
            return {message: "Reminder sent successfully"}
        }   
)

//Create an empty array where we will export Inngest functions
export const functions = [
    syncUserCreation, 
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder
];