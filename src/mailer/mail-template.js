// an email template that can be used with Nodemailer to send emails

const HTML_TEMPLATE = (content, describe) => {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>NodeMailer Email</title>
          <style>
            .container {
              width: 100%;
              height: 100%;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .email {
              width: 80%;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
            }
            .email-header {
              background-color: #333;
              color: #fff;
              padding: 20px;
              text-align: center;
            }
            .email-body {
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email">
              <div class="email-header">
                <h1>${content}</h1>
              </div>
              <div class="email-body">
                <p>${describe}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
}

export default HTML_TEMPLATE