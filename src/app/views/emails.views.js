const { APP } = require('../../config/app.config')

exports.confirmEmail = ({ username, URL }) => `
   <!doctype html>
   <html>
      <head>
         <meta name="viewport" content="width=device-width" />
         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
         <style>
            img {
               border: none;
               -ms-interpolation-mode: bicubic;
               max-width: 100%;
            }
            body {
               background-color: #f6f6f6;
               font-family: sans-serif;
               -webkit-font-smoothing: antialiased;
               font-size: 14px;
               line-height: 1.4;
               margin: 0;
               padding: 0;
               -ms-text-size-adjust: 100%;
               -webkit-text-size-adjust: 100%;
            }
            table {
               border-collapse: separate;
               mso-table-lspace: 0pt;
               mso-table-rspace: 0pt;
               width: 100%;
            }
            table td {
               font-family: sans-serif;
               font-size: 14px;
               vertical-align: top;
            }
            .body {
               background-color: #f6f6f6;
               width: 100%;
            }
            .container {
               display: block;
               margin: 0 auto !important;
               /* makes it centered */
               max-width: 580px;
               padding: 10px;
               width: 580px;
            }
            .content {
               box-sizing: border-box;
               display: block;
               margin: 0 auto;
               max-width: 580px;
               padding: 10px;
            }
            .main {
               background: #ffffff;
               border-radius: 3px;
               width: 100%;
            }
            .wrapper {
               box-sizing: border-box;
               padding: 20px;
            }
            .content-block {
               padding-bottom: 10px;
               padding-top: 10px;
            }
            .footer {
               clear: both;
               margin-top: 10px;
               text-align: center;
               width: 100%;
            }
            .footer td,
            .footer p,
            .footer span,
            .footer a {
               color: #999999;
               font-size: 12px;
               text-align: center;
            }
            h1,
            h2,
            h3,
            h4 {
               color: #000000;
               font-family: sans-serif;
               font-weight: 400;
               line-height: 1.4;
               margin: 0;
               margin-bottom: 30px;
            }
            h1 {
               font-size: 35px;
               font-weight: 300;
               text-align: center;
               text-transform: capitalize;
            }
            p,
            ul,
            ol {
               font-family: sans-serif;
               font-size: 14px;
               font-weight: normal;
               margin: 0;
               margin-bottom: 15px;
            }
            p li,
            ul li,
            ol li {
               list-style-position: inside;
               margin-left: 5px;
            }
            a {
               color: #55c57a;
               text-decoration: underline;
            }
            .btn {
               box-sizing: border-box;
               width: 100%;
            }
            .btn > tbody > tr > td {
               padding-bottom: 15px;
            }
            .btn table {
               width: auto;
            }
            .btn table td {
               background-color: #ffffff;
               border-radius: 5px;
               text-align: center;
            }
            .btn a {
               background-color: #ffffff;
               border: solid 1px #55c57a;
               border-radius: 5px;
               box-sizing: border-box;
               color: #55c57a;
               cursor: pointer;
               display: inline-block;
               font-size: 14px;
               font-weight: bold;
               margin: 0;
               padding: 12px 25px;
               text-decoration: none;
               text-transform: capitalize;
            }
            .btn-primary table td {
               background-color: #55c57a;
            }
            .btn-primary a {
               background-color: #55c57a;
               border-color: #55c57a;
               color: #ffffff;
            }
            .last {
               margin-bottom: 0;
            }
            .first {
               margin-top: 0;
            }
            .align-center {
               text-align: center;
            }
            .align-right {
               text-align: right;
            }
            .align-left {
               text-align: left;
            }
            .clear {
               clear: both;
            }
            .mt0 {
               margin-top: 0;
            }
            .mb0 {
               margin-bottom: 0;
            }
            .preheader {
               color: transparent;
               display: none;
               height: 0;
               max-height: 0;
               max-width: 0;
               opacity: 0;
               overflow: hidden;
               mso-hide: all;
               visibility: hidden;
               width: 0;
            }
            .powered-by a {
               text-decoration: none;
            }
            hr {
               border: 0;
               border-bottom: 1px solid #f6f6f6;
               margin: 20px 0;
            }
            @media only screen and (max-width: 620px) {
               table[class='body'] h1 {
                  font-size: 28px !important;
                  margin-bottom: 10px !important;
               }
               table[class='body'] p,
               table[class='body'] ul,
               table[class='body'] ol,
               table[class='body'] td,
               table[class='body'] span,
               table[class='body'] a {
                  font-size: 16px !important;
               }
               table[class='body'] .wrapper,
               table[class='body'] .article {
                  padding: 10px !important;
               }
               table[class='body'] .content {
                  padding: 0 !important;
               }
               table[class='body'] .container {
                  padding: 0 !important;
                  width: 100% !important;
               }
               table[class='body'] .main {
                  border-left-width: 0 !important;
                  border-radius: 0 !important;
                  border-right-width: 0 !important;
               }
               table[class='body'] .btn table {
                  width: 100% !important;
               }
               table[class='body'] .btn a {
                  width: 100% !important;
               }
               table[class='body'] .img-responsive {
                  height: auto !important;
                  max-width: 100% !important;
                  width: auto !important;
               }
            }
            @media all {
               .ExternalClass {
                  width: 100%;
               }
               .ExternalClass,
               .ExternalClass p,
               .ExternalClass span,
               .ExternalClass font,
               .ExternalClass td,
               .ExternalClass div {
                  line-height: 100%;
               }
               .apple-link a {
                  color: inherit !important;
                  font-family: inherit !important;
                  font-size: inherit !important;
                  font-weight: inherit !important;
                  line-height: inherit !important;
                  text-decoration: none !important;
               }
               .btn-primary table td:hover {
                  background-color: #2e864b !important;
               }
               .btn-primary a:hover {
                  background-color: #2e864b !important;
                  border-color: #2e864b !important;
               }
            }
         </style>
         <title>Email</title>
      </head>
      <body>
         <table
            class="body"
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
         >
            <tbody>
               <tr>
                  <td></td>
                  <td class="container">
                     <div class="content">
                        <!-- START CENTERED WHITE CONTAINER-->
                        <table class="main" role="presentation">
                           <!-- START MAIN AREA-->
                           <tbody>
                              <tr>
                                 <td class="wrapper">
                                    <table
                                       role="presentation"
                                       border="0"
                                       cellpadding="0"
                                       cellspacing="0"
                                    >
                                       <tbody>
                                          <tr>
                                             <td>
                                                <!-- CONTENT-->
                                                <p>Hi ${username},</p>
                                                <p>Please confirm your email</p>
                                                <p>
                                                   If you didn't create an account
                                                   with ${APP.name}, you can safely
                                                   ignore or delete this email.
                                                </p>
                                                <table
                                                   class="btn btn-primary"
                                                   role="presentation"
                                                   border="0"
                                                   cellpadding="0"
                                                   cellspacing="0"
                                                >
                                                   <tbody>
                                                      <tr>
                                                         <td align="left">
                                                            <table
                                                               role="presentation"
                                                               border="0"
                                                               cellpadding="0"
                                                               cellspacing="0"
                                                            >
                                                               <tbody>
                                                                  <tr>
                                                                     <td>
                                                                        <a
                                                                           href="${URL}"
                                                                           target="_blank"
                                                                           >Click!!</a
                                                                        >
                                                                     </td>
                                                                  </tr>
                                                               </tbody>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </tbody>
                                                </table>
                                                <p>
                                                   If you need any help with
                                                   your account, please don't
                                                   hesitate to contact us.
                                                </p>
                                                <p>- ${APP.name}, CEO</p>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        <!-- START FOOTER-->
                        <div class="footer">
                           <table
                              role="presentation"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                           >
                              <tbody>
                                 <tr>
                                    <td class="content-block">
                                       <span class="apple-link"
                                          >${APP.name} Inc</span
                                       >
                                    </td>
                                    <td class="content-block">
                                       <span class="apple-link"
                                          >goal is ${APP.description}</span
                                       >
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </td>
               </tr>
            </tbody>
         </table>
      </body>
   </html>
   `

exports.changeEmail = ({ username, URL, newEmail }) => `
   <!doctype html>
   <html>
      <head>
         <meta name="viewport" content="width=device-width" />
         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
         <style>
            img {
               border: none;
               -ms-interpolation-mode: bicubic;
               max-width: 100%;
            }
            body {
               background-color: #f6f6f6;
               font-family: sans-serif;
               -webkit-font-smoothing: antialiased;
               font-size: 14px;
               line-height: 1.4;
               margin: 0;
               padding: 0;
               -ms-text-size-adjust: 100%;
               -webkit-text-size-adjust: 100%;
            }
            table {
               border-collapse: separate;
               mso-table-lspace: 0pt;
               mso-table-rspace: 0pt;
               width: 100%;
            }
            table td {
               font-family: sans-serif;
               font-size: 14px;
               vertical-align: top;
            }
            .body {
               background-color: #f6f6f6;
               width: 100%;
            }
            .container {
               display: block;
               margin: 0 auto !important;
               /* makes it centered */
               max-width: 580px;
               padding: 10px;
               width: 580px;
            }
            .content {
               box-sizing: border-box;
               display: block;
               margin: 0 auto;
               max-width: 580px;
               padding: 10px;
            }
            .main {
               background: #ffffff;
               border-radius: 3px;
               width: 100%;
            }
            .wrapper {
               box-sizing: border-box;
               padding: 20px;
            }
            .content-block {
               padding-bottom: 10px;
               padding-top: 10px;
            }
            .footer {
               clear: both;
               margin-top: 10px;
               text-align: center;
               width: 100%;
            }
            .footer td,
            .footer p,
            .footer span,
            .footer a {
               color: #999999;
               font-size: 12px;
               text-align: center;
            }
            h1,
            h2,
            h3,
            h4 {
               color: #000000;
               font-family: sans-serif;
               font-weight: 400;
               line-height: 1.4;
               margin: 0;
               margin-bottom: 30px;
            }
            h1 {
               font-size: 35px;
               font-weight: 300;
               text-align: center;
               text-transform: capitalize;
            }
            p,
            ul,
            ol {
               font-family: sans-serif;
               font-size: 14px;
               font-weight: normal;
               margin: 0;
               margin-bottom: 15px;
            }
            p li,
            ul li,
            ol li {
               list-style-position: inside;
               margin-left: 5px;
            }
            a {
               color: #55c57a;
               text-decoration: underline;
            }
            .btn {
               box-sizing: border-box;
               width: 100%;
            }
            .btn > tbody > tr > td {
               padding-bottom: 15px;
            }
            .btn table {
               width: auto;
            }
            .btn table td {
               background-color: #ffffff;
               border-radius: 5px;
               text-align: center;
            }
            .btn a {
               background-color: #ffffff;
               border: solid 1px #55c57a;
               border-radius: 5px;
               box-sizing: border-box;
               color: #55c57a;
               cursor: pointer;
               display: inline-block;
               font-size: 14px;
               font-weight: bold;
               margin: 0;
               padding: 12px 25px;
               text-decoration: none;
               text-transform: capitalize;
            }
            .btn-primary table td {
               background-color: #55c57a;
            }
            .btn-primary a {
               background-color: #55c57a;
               border-color: #55c57a;
               color: #ffffff;
            }
            .last {
               margin-bottom: 0;
            }
            .first {
               margin-top: 0;
            }
            .align-center {
               text-align: center;
            }
            .align-right {
               text-align: right;
            }
            .align-left {
               text-align: left;
            }
            .clear {
               clear: both;
            }
            .mt0 {
               margin-top: 0;
            }
            .mb0 {
               margin-bottom: 0;
            }
            .preheader {
               color: transparent;
               display: none;
               height: 0;
               max-height: 0;
               max-width: 0;
               opacity: 0;
               overflow: hidden;
               mso-hide: all;
               visibility: hidden;
               width: 0;
            }
            .powered-by a {
               text-decoration: none;
            }
            hr {
               border: 0;
               border-bottom: 1px solid #f6f6f6;
               margin: 20px 0;
            }
            @media only screen and (max-width: 620px) {
               table[class='body'] h1 {
                  font-size: 28px !important;
                  margin-bottom: 10px !important;
               }
               table[class='body'] p,
               table[class='body'] ul,
               table[class='body'] ol,
               table[class='body'] td,
               table[class='body'] span,
               table[class='body'] a {
                  font-size: 16px !important;
               }
               table[class='body'] .wrapper,
               table[class='body'] .article {
                  padding: 10px !important;
               }
               table[class='body'] .content {
                  padding: 0 !important;
               }
               table[class='body'] .container {
                  padding: 0 !important;
                  width: 100% !important;
               }
               table[class='body'] .main {
                  border-left-width: 0 !important;
                  border-radius: 0 !important;
                  border-right-width: 0 !important;
               }
               table[class='body'] .btn table {
                  width: 100% !important;
               }
               table[class='body'] .btn a {
                  width: 100% !important;
               }
               table[class='body'] .img-responsive {
                  height: auto !important;
                  max-width: 100% !important;
                  width: auto !important;
               }
            }
            @media all {
               .ExternalClass {
                  width: 100%;
               }
               .ExternalClass,
               .ExternalClass p,
               .ExternalClass span,
               .ExternalClass font,
               .ExternalClass td,
               .ExternalClass div {
                  line-height: 100%;
               }
               .apple-link a {
                  color: inherit !important;
                  font-family: inherit !important;
                  font-size: inherit !important;
                  font-weight: inherit !important;
                  line-height: inherit !important;
                  text-decoration: none !important;
               }
               .btn-primary table td:hover {
                  background-color: #2e864b !important;
               }
               .btn-primary a:hover {
                  background-color: #2e864b !important;
                  border-color: #2e864b !important;
               }
            }
         </style>
         <title>Email</title>
      </head>
      <body>
         <table
            class="body"
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
         >
            <tbody>
               <tr>
                  <td></td>
                  <td class="container">
                     <div class="content">
                        <!-- START CENTERED WHITE CONTAINER-->
                        <table class="main" role="presentation">
                           <!-- START MAIN AREA-->
                           <tbody>
                              <tr>
                                 <td class="wrapper">
                                    <table
                                       role="presentation"
                                       border="0"
                                       cellpadding="0"
                                       cellspacing="0"
                                    >
                                       <tbody>
                                          <tr>
                                             <td>
                                                <!-- CONTENT-->
                                                <p>Hi ${username},</p>
                                                <p>Request to change your email to '${newEmail}'</p>
                                                <p>Please click the bottom below to confirm</p>
                                                <p>
                                                   If you didn't create an account
                                                   with ${APP.name}, you can safely
                                                   ignore or delete this email.
                                                </p>
                                                <table
                                                   class="btn btn-primary"
                                                   role="presentation"
                                                   border="0"
                                                   cellpadding="0"
                                                   cellspacing="0"
                                                >
                                                   <tbody>
                                                      <tr>
                                                         <td align="left">
                                                            <table
                                                               role="presentation"
                                                               border="0"
                                                               cellpadding="0"
                                                               cellspacing="0"
                                                            >
                                                               <tbody>
                                                                  <tr>
                                                                     <td>
                                                                        <a
                                                                           href="${URL}"
                                                                           target="_blank"
                                                                           >Click!!</a
                                                                        >
                                                                     </td>
                                                                  </tr>
                                                               </tbody>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </tbody>
                                                </table>
                                                <p>
                                                   If you need any help with
                                                   your account, please don't
                                                   hesitate to contact us.
                                                </p>
                                                <p>- ${APP.name}, CEO</p>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        <!-- START FOOTER-->
                        <div class="footer">
                           <table
                              role="presentation"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                           >
                              <tbody>
                                 <tr>
                                    <td class="content-block">
                                       <span class="apple-link"
                                          >${APP.name} Inc</span
                                       >
                                    </td>
                                    <td class="content-block">
                                       <span class="apple-link"
                                          >goal is ${APP.description}</span
                                       >
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </td>
               </tr>
            </tbody>
         </table>
      </body>
   </html>
   `

exports.confirmEmailDone = ({ username }) => `<head>
   <meta charset="UTF-8"/>
   <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
   <style>
     body {
     font-family: "Roboto", sans-serif;
     }
     .container {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     background-color: rgba(241, 241, 241, 0.5);
     padding: 3vw;
     text-align: center;
     border: 0.3vw solid black;
     border-radius: 1vw;
     }
     .header {
     margin-top: auto;
     font-size: 3vw;
     font-weight: bold;
     }
     .message {
     margin-top: -2vh;
     font-size: 2vw;
     }
   </style>
   <title></title>
 </head>
 <div class="container">
   <h6 class="header">your email is confirmed ${username} &#x2714;</h6>
   <div class="message">Please make your self at home <a href="http://localhost:3000/">${APP.name} ${APP.version}</a> &#x1F60A;</div>
 </div>`

exports.changeEmailDone = ({ newEmail }) => `<head>
<meta charset="UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  body {
  font-family: "Roboto", sans-serif;
  }
  .container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(241, 241, 241, 0.5);
  padding: 3vw;
  text-align: center;
  border: 0.3vw solid black;
  border-radius: 1vw;
  }
  .header {
  margin-top: auto;
  font-size: 3vw;
  font-weight: bold;
  }
  .message {
  margin-top: -2vh;
  font-size: 2vw;
  }
</style>
<title></title>
</head>
<div class="container">
<h6 class="header">your email is changed to '${newEmail}' &#x2714;</h6>
<div class="message">Please confirm your new email to start using ${APP.name} ${APP.version} &#x1F60A;</div>
</div>`

exports.forgetPassword = ({ URL }) => `<!doctype html>
   <html>
      <head>
         <meta name="viewport" content="width=device-width" />
         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
         <style>
            img {
               border: none;
               -ms-interpolation-mode: bicubic;
               max-width: 100%;
            }
            body {
               background-color: #f6f6f6;
               font-family: sans-serif;
               -webkit-font-smoothing: antialiased;
               font-size: 14px;
               line-height: 1.4;
               margin: 0;
               padding: 0;
               -ms-text-size-adjust: 100%;
               -webkit-text-size-adjust: 100%;
            }
            table {
               border-collapse: separate;
               mso-table-lspace: 0pt;
               mso-table-rspace: 0pt;
               width: 100%;
            }
            table td {
               font-family: sans-serif;
               font-size: 14px;
               vertical-align: top;
            }
            .body {
               background-color: #f6f6f6;
               width: 100%;
            }
            .container {
               display: block;
               margin: 0 auto !important;
               /* makes it centered */
               max-width: 580px;
               padding: 10px;
               width: 580px;
            }
            .content {
               box-sizing: border-box;
               display: block;
               margin: 0 auto;
               max-width: 580px;
               padding: 10px;
            }
            .main {
               background: #ffffff;
               border-radius: 3px;
               width: 100%;
            }
            .wrapper {
               box-sizing: border-box;
               padding: 20px;
            }
            .content-block {
               padding-bottom: 10px;
               padding-top: 10px;
            }
            .footer {
               clear: both;
               margin-top: 10px;
               text-align: center;
               width: 100%;
            }
            .footer td,
            .footer p,
            .footer span,
            .footer a {
               color: #999999;
               font-size: 12px;
               text-align: center;
            }
            h1,
            h2,
            h3,
            h4 {
               color: #000000;
               font-family: sans-serif;
               font-weight: 400;
               line-height: 1.4;
               margin: 0;
               margin-bottom: 30px;
            }
            h1 {
               font-size: 35px;
               font-weight: 300;
               text-align: center;
               text-transform: capitalize;
            }
            p,
            ul,
            ol {
               font-family: sans-serif;
               font-size: 14px;
               font-weight: normal;
               margin: 0;
               margin-bottom: 15px;
            }
            p li,
            ul li,
            ol li {
               list-style-position: inside;
               margin-left: 5px;
            }
            a {
               color: #55c57a;
               text-decoration: underline;
            }
            .btn {
               box-sizing: border-box;
               width: 100%;
            }
            .btn > tbody > tr > td {
               padding-bottom: 15px;
            }
            .btn table {
               width: auto;
            }
            .btn table td {
               background-color: #ffffff;
               border-radius: 5px;
               text-align: center;
            }
            .btn a {
               background-color: #ffffff;
               border: solid 1px #55c57a;
               border-radius: 5px;
               box-sizing: border-box;
               color: #55c57a;
               cursor: pointer;
               display: inline-block;
               font-size: 14px;
               font-weight: bold;
               margin: 0;
               padding: 12px 25px;
               text-decoration: none;
               text-transform: capitalize;
            }
            .btn-primary table td {
               background-color: #55c57a;
            }
            .btn-primary a {
               background-color: #55c57a;
               border-color: #55c57a;
               color: #ffffff;
            }
            .last {
               margin-bottom: 0;
            }
            .first {
               margin-top: 0;
            }
            .align-center {
               text-align: center;
            }
            .align-right {
               text-align: right;
            }
            .align-left {
               text-align: left;
            }
            .clear {
               clear: both;
            }
            .mt0 {
               margin-top: 0;
            }
            .mb0 {
               margin-bottom: 0;
            }
            .preheader {
               color: transparent;
               display: none;
               height: 0;
               max-height: 0;
               max-width: 0;
               opacity: 0;
               overflow: hidden;
               mso-hide: all;
               visibility: hidden;
               width: 0;
            }
            .powered-by a {
               text-decoration: none;
            }
            hr {
               border: 0;
               border-bottom: 1px solid #f6f6f6;
               margin: 20px 0;
            }
            @media only screen and (max-width: 620px) {
               table[class='body'] h1 {
                  font-size: 28px !important;
                  margin-bottom: 10px !important;
               }
               table[class='body'] p,
               table[class='body'] ul,
               table[class='body'] ol,
               table[class='body'] td,
               table[class='body'] span,
               table[class='body'] a {
                  font-size: 16px !important;
               }
               table[class='body'] .wrapper,
               table[class='body'] .article {
                  padding: 10px !important;
               }
               table[class='body'] .content {
                  padding: 0 !important;
               }
               table[class='body'] .container {
                  padding: 0 !important;
                  width: 100% !important;
               }
               table[class='body'] .main {
                  border-left-width: 0 !important;
                  border-radius: 0 !important;
                  border-right-width: 0 !important;
               }
               table[class='body'] .btn table {
                  width: 100% !important;
               }
               table[class='body'] .btn a {
                  width: 100% !important;
               }
               table[class='body'] .img-responsive {
                  height: auto !important;
                  max-width: 100% !important;
                  width: auto !important;
               }
            }
            @media all {
               .ExternalClass {
                  width: 100%;
               }
               .ExternalClass,
               .ExternalClass p,
               .ExternalClass span,
               .ExternalClass font,
               .ExternalClass td,
               .ExternalClass div {
                  line-height: 100%;
               }
               .apple-link a {
                  color: inherit !important;
                  font-family: inherit !important;
                  font-size: inherit !important;
                  font-weight: inherit !important;
                  line-height: inherit !important;
                  text-decoration: none !important;
               }
               .btn-primary table td:hover {
                  background-color: #2e864b !important;
               }
               .btn-primary a:hover {
                  background-color: #2e864b !important;
                  border-color: #2e864b !important;
               }
            }
         </style>
         <title>Email</title>
      </head>
      <body>
         <table
            class="body"
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
         >
            <tbody>
               <tr>
                  <td></td>
                  <td class="container">
                     <div class="content">
                        <!-- START CENTERED WHITE CONTAINER-->
                        <table class="main" role="presentation">
                           <!-- START MAIN AREA-->
                           <tbody>
                              <tr>
                                 <td class="wrapper">
                                    <table
                                       role="presentation"
                                       border="0"
                                       cellpadding="0"
                                       cellspacing="0"
                                    >
                                       <tbody>
                                          <tr>
                                             <td>
                                                <!-- CONTENT-->
                                                <p>Reset your password</p>
                                                <p>
                                                   If you didn't create an account
                                                   with ${APP.name}, you can safely
                                                   ignore or delete this email.
                                                </p>
                                                <table
                                                   class="btn btn-primary"
                                                   role="presentation"
                                                   border="0"
                                                   cellpadding="0"
                                                   cellspacing="0"
                                                >
                                                   <tbody>
                                                      <tr>
                                                         <td align="left">
                                                            <table
                                                               role="presentation"
                                                               border="0"
                                                               cellpadding="0"
                                                               cellspacing="0"
                                                            >
                                                               <tbody>
                                                                  <tr>
                                                                     <td>
                                                                        <a
                                                                           href="${URL}"
                                                                           target="_blank"
                                                                           >Click!!</a
                                                                        >
                                                                     </td>
                                                                  </tr>
                                                               </tbody>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </tbody>
                                                </table>
                                                <p>
                                                   If you need any help with
                                                   your account, please don't
                                                   hesitate to contact us.
                                                </p>
                                                <p>- ${APP.name}, CEO</p>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        <!-- START FOOTER-->
                        <div class="footer">
                           <table
                              role="presentation"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                           >
                              <tbody>
                                 <tr>
                                    <td class="content-block">
                                       <span class="apple-link"
                                          >${APP.name} Inc</span
                                       >
                                    </td>
                                    <td class="content-block">
                                       <span class="apple-link"
                                          >goal is ${APP.description}</span
                                       >
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </td>
               </tr>
            </tbody>
         </table>
      </body>
   </html>`

exports.acceptInvite = ({ inviterName, channelName, username, URL }) => `
<!doctype html>
<html>
   <head>
      <meta name="viewport" content="width=device-width" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <style>
         img {
            border: none;
            -ms-interpolation-mode: bicubic;
            max-width: 100%;
         }
         body {
            background-color: #f6f6f6;
            font-family: sans-serif;
            -webkit-font-smoothing: antialiased;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
         }
         table {
            border-collapse: separate;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            width: 100%;
         }
         table td {
            font-family: sans-serif;
            font-size: 14px;
            vertical-align: top;
         }
         .body {
            background-color: #f6f6f6;
            width: 100%;
         }
         .container {
            display: block;
            margin: 0 auto !important;
            /* makes it centered */
            max-width: 580px;
            padding: 10px;
            width: 580px;
         }
         .content {
            box-sizing: border-box;
            display: block;
            margin: 0 auto;
            max-width: 580px;
            padding: 10px;
         }
         .main {
            background: #ffffff;
            border-radius: 3px;
            width: 100%;
         }
         .wrapper {
            box-sizing: border-box;
            padding: 20px;
         }
         .content-block {
            padding-bottom: 10px;
            padding-top: 10px;
         }
         .footer {
            clear: both;
            margin-top: 10px;
            text-align: center;
            width: 100%;
         }
         .footer td,
         .footer p,
         .footer span,
         .footer a {
            color: #999999;
            font-size: 12px;
            text-align: center;
         }
         h1,
         h2,
         h3,
         h4 {
            color: #000000;
            font-family: sans-serif;
            font-weight: 400;
            line-height: 1.4;
            margin: 0;
            margin-bottom: 30px;
         }
         h1 {
            font-size: 35px;
            font-weight: 300;
            text-align: center;
            text-transform: capitalize;
         }
         p,
         ul,
         ol {
            font-family: sans-serif;
            font-size: 14px;
            font-weight: normal;
            margin: 0;
            margin-bottom: 15px;
         }
         p li,
         ul li,
         ol li {
            list-style-position: inside;
            margin-left: 5px;
         }
         a {
            color: #55c57a;
            text-decoration: underline;
         }
         .btn {
            box-sizing: border-box;
            width: 100%;
         }
         .btn > tbody > tr > td {
            padding-bottom: 15px;
         }
         .btn table {
            width: auto;
         }
         .btn table td {
            background-color: #ffffff;
            border-radius: 5px;
            text-align: center;
         }
         .btn a {
            background-color: #ffffff;
            border: solid 1px #55c57a;
            border-radius: 5px;
            box-sizing: border-box;
            color: #55c57a;
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            font-weight: bold;
            margin: 0;
            padding: 12px 25px;
            text-decoration: none;
            text-transform: capitalize;
         }
         .btn-primary table td {
            background-color: #55c57a;
         }
         .btn-primary a {
            background-color: #55c57a;
            border-color: #55c57a;
            color: #ffffff;
         }
         .last {
            margin-bottom: 0;
         }
         .first {
            margin-top: 0;
         }
         .align-center {
            text-align: center;
         }
         .align-right {
            text-align: right;
         }
         .align-left {
            text-align: left;
         }
         .clear {
            clear: both;
         }
         .mt0 {
            margin-top: 0;
         }
         .mb0 {
            margin-bottom: 0;
         }
         .preheader {
            color: transparent;
            display: none;
            height: 0;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
            mso-hide: all;
            visibility: hidden;
            width: 0;
         }
         .powered-by a {
            text-decoration: none;
         }
         hr {
            border: 0;
            border-bottom: 1px solid #f6f6f6;
            margin: 20px 0;
         }
         @media only screen and (max-width: 620px) {
            table[class='body'] h1 {
               font-size: 28px !important;
               margin-bottom: 10px !important;
            }
            table[class='body'] p,
            table[class='body'] ul,
            table[class='body'] ol,
            table[class='body'] td,
            table[class='body'] span,
            table[class='body'] a {
               font-size: 16px !important;
            }
            table[class='body'] .wrapper,
            table[class='body'] .article {
               padding: 10px !important;
            }
            table[class='body'] .content {
               padding: 0 !important;
            }
            table[class='body'] .container {
               padding: 0 !important;
               width: 100% !important;
            }
            table[class='body'] .main {
               border-left-width: 0 !important;
               border-radius: 0 !important;
               border-right-width: 0 !important;
            }
            table[class='body'] .btn table {
               width: 100% !important;
            }
            table[class='body'] .btn a {
               width: 100% !important;
            }
            table[class='body'] .img-responsive {
               height: auto !important;
               max-width: 100% !important;
               width: auto !important;
            }
         }
         @media all {
            .ExternalClass {
               width: 100%;
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
               line-height: 100%;
            }
            .apple-link a {
               color: inherit !important;
               font-family: inherit !important;
               font-size: inherit !important;
               font-weight: inherit !important;
               line-height: inherit !important;
               text-decoration: none !important;
            }
            .btn-primary table td:hover {
               background-color: #2e864b !important;
            }
            .btn-primary a:hover {
               background-color: #2e864b !important;
               border-color: #2e864b !important;
            }
         }
      </style>
      <title>Email</title>
   </head>
   <body>
      <table
         class="body"
         role="presentation"
         border="0"
         cellpadding="0"
         cellspacing="0"
      >
         <tbody>
            <tr>
               <td></td>
               <td class="container">
                  <div class="content">
                     <!-- START CENTERED WHITE CONTAINER-->
                     <table class="main" role="presentation">
                        <!-- START MAIN AREA-->
                        <tbody>
                           <tr>
                              <td class="wrapper">
                                 <table
                                    role="presentation"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                 >
                                    <tbody>
                                       <tr>
                                          <td>
                                             <!-- CONTENT-->
                                             <p>Hi ${username},</p>
                                             <p>Your are being Invited to channel '${channelName}' by ${inviterName}</p>
                                             <p>
                                                If you didn't create an account
                                                with ${APP.name}, you can safely
                                                ignore or delete this email.
                                             </p>
                                             <table
                                                class="btn btn-primary"
                                                role="presentation"
                                                border="0"
                                                cellpadding="0"
                                                cellspacing="0"
                                             >
                                                <tbody>
                                                   <tr>
                                                      <td align="left">
                                                         <table
                                                            role="presentation"
                                                            border="0"
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                         >
                                                            <tbody>
                                                               <tr>
                                                                  <td>
                                                                     <a
                                                                        href="${URL}"
                                                                        target="_blank"
                                                                        >Click!!</a
                                                                     >
                                                                  </td>
                                                               </tr>
                                                            </tbody>
                                                         </table>
                                                      </td>
                                                   </tr>
                                                </tbody>
                                             </table>
                                             <p>
                                                If you need any help with
                                                your account, please don't
                                                hesitate to contact us.
                                             </p>
                                             <p>- ${APP.name}, CEO</p>
                                          </td>
                                       </tr>
                                    </tbody>
                                 </table>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                     <!-- START FOOTER-->
                     <div class="footer">
                        <table
                           role="presentation"
                           border="0"
                           cellpadding="0"
                           cellspacing="0"
                        >
                           <tbody>
                              <tr>
                                 <td class="content-block">
                                    <span class="apple-link"
                                       >${APP.name} Inc</span
                                    >
                                 </td>
                                 <td class="content-block">
                                    <span class="apple-link"
                                       >goal is ${APP.description}</span
                                    >
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
               </td>
            </tr>
         </tbody>
      </table>
   </body>
</html>
`
