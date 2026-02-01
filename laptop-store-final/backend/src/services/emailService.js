/**
 * Mock Email Service
 * In a real application, this would use nodemailer to send actual emails.
 */

const sendEmail = async (to, subject, text) => {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`
    [EMAIL SERVICE MOCK]
    --------------------
    To: ${to}
    Subject: ${subject}
    Body:
    ${text}
    --------------------
    `);

    return true;
};

const sendWelcomeEmail = async (user) => {
    const subject = 'Welcome to Laptop Store!';
    const text = `Hi ${user.username},\n\nWelcome to Laptop Store! We are excited to have you on board.\n\nBest,\nLaptop Store Team`;
    await sendEmail(user.email, subject, text);
};

const sendOrderConfirmation = async (order, user) => {
    const subject = `Order Confirmation #${order.orderNumber}`;
    const text = `Hi ${user.username},\n\nThank you for your order! We have received your order #${order.orderNumber} for $${order.total.toFixed(2)}.\n\nWe will notify you when it ships.\n\nBest,\nLaptop Store Team`;
    await sendEmail(user.email, subject, text);
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendOrderConfirmation
};
