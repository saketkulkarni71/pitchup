import { Resend } from 'resend';

// Initialize Resend
// User must install the package: npm install resend
// And set RESEND_API_KEY in .env.local
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendConfirmationEmail(
    toEmail: string,
    bookingDetails: {
        venueName: string;
        date: string;
        time: string;
        price: number;
        bookingRef: string;
    }
) {
    if (!resend) {
        console.log("⚠️ Resend API Key missing or package not installed. Skipping email.");
        console.log("📧 Would send email to:", toEmail, bookingDetails);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'PitchUp <onboarding@resend.dev>', // Update this with your verified domain
            to: [toEmail],
            subject: `Booking Confirmed: ${bookingDetails.venueName} 🎾`,
            html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>You're all set!</h1>
          <p>Your booking at <strong>${bookingDetails.venueName}</strong> has been confirmed.</p>
          
          <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; margin: 20px 0;">
             <p><strong>Date:</strong> ${bookingDetails.date}</p>
             <p><strong>Time:</strong> ${bookingDetails.time}</p>
             <p><strong>Price:</strong> €${bookingDetails.price}</p>
             <p><strong>Reference:</strong> ${bookingDetails.bookingRef}</p>
          </div>
          
          <p>Please arrive 10 minutes early. Have a great game!</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View My Bookings</a>
        </div>
      `,
        });

        if (error) {
            console.error("Resend Error:", error);
        } else {
            console.log("✅ Email sent successfully:", data?.id);
        }
    } catch (err) {
        console.error("Email Sending Exception:", err);
    }
}
