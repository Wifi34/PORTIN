import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from backend.app.core.config import settings

logger = logging.getLogger("portin.email")

class EmailService:
    @staticmethod
    def send_password_reset_email(to_email: str, reset_token: str) -> bool:
        """
        Sends an official password reset email via Gmail SMTP with modern HTML template.
        Falls back safely if SMTP is disabled or unconfigured.
        """
        if not settings.SMTP_ENABLED or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info(f"[EmailService Local Fallback] Reset token for {to_email}: {reset_token}")
            return False

        subject = "PortIN — Security Verification & Password Reset Request"
        reset_link = f"http://localhost:5173/reset-password?email={to_email}&token={reset_token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050B18; color: #F8FBFF; margin: 0; padding: 20px; }}
            .container {{ max-width: 540px; margin: 0 auto; background-color: #081426; border: 1px solid #00B8D9; border-radius: 16px; padding: 30px; }}
            .header {{ text-align: center; border-bottom: 1px solid #1E293B; padding-bottom: 15px; margin-bottom: 20px; }}
            .brand {{ font-size: 24px; font-weight: 900; color: #FFFFFF; }}
            .brand span {{ color: #00B8D9; }}
            .token-box {{ background-color: #060F1E; border: 1px dashed #00B8D9; border-radius: 10px; padding: 15px; text-align: center; margin: 25px 0; }}
            .token {{ font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #62E5F2; }}
            .btn {{ display: inline-block; background: linear-gradient(135deg, #00B8D9, #62E5F2); color: #050B18; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 15px 0; }}
            .footer {{ font-size: 11px; color: #64748B; text-align: center; margin-top: 25px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">Port<span>IN</span></div>
              <p style="font-size: 12px; color: #94A3B8; margin-top: 4px;">SAIL Maritime Freight Intelligence & Procurement</p>
            </div>
            
            <p>Hello,</p>
            <p>A password reset request has been initiated for your PortIN account (<strong>{to_email}</strong>).</p>
            
            <div class="token-box">
              <div style="font-size: 11px; text-transform: uppercase; color: #94A3B8; margin-bottom: 5px;">Your One-Time Reset Token</div>
              <div class="token">{reset_token}</div>
            </div>

            <div style="text-align: center;">
              <a href="{reset_link}" class="btn">Reset Your Password</a>
            </div>

            <p style="font-size: 12px; color: #94A3B8;">This token is valid for 15 minutes. If you did not request this change, please disregard this email or report to the system administrator.</p>

            <div class="footer">
              Steel Authority of India Limited (SAIL) &bull; Smart India Hackathon 2026<br/>
              Government of India &bull; Ministry of Steel
            </div>
          </div>
        </body>
        </html>
        """

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"PortIN Console <{settings.SMTP_USER}>"
            msg["To"] = to_email

            part1 = MIMEText(f"Your PortIN Password Reset Token is: {reset_token}\nVisit: {reset_link}", "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

            logger.info(f"Password reset email sent successfully to {to_email} via Gmail SMTP.")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via Gmail SMTP: {e}")
            return False
