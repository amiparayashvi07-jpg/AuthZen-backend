import nodemailer from 'nodemailer'
export const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_KEY,
    }
});

export const sendemail = async({email,subject,text})=>{
    try{
        let info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to:email,
            subject:subject,
            text:text
        })
        console.log("Mail sent",info.messageId);
        
    }catch(error){
        console.error(error);
        throw new Error(error);
    }
}