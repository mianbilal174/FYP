import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.config import settings
from app.models import Alert, AlertType

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending alert notifications via Gmail SMTP"""
    
    @staticmethod
    async def send_alert_email(alert: Alert, recipient_email: str):
        """Send alert notification email"""
        try:
            # Create email message
            message = MIMEMultipart("alternative")
            message["Subject"] = f"🚨 Smart Crop Alert: {alert.alert_type.value.replace('_', ' ').title()}"
            message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            message["To"] = recipient_email
            
            # Create HTML email body
            html_body = EmailService._create_alert_html(alert)
            
            # Create plain text version
            text_body = EmailService._create_alert_text(alert)
            
            # Attach both versions
            part1 = MIMEText(text_body, "plain")
            part2 = MIMEText(html_body, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
                start_tls=True,
            )
            
            logger.info(f"✅ Alert email sent to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return False
    
    @staticmethod
    def _create_alert_text(alert: Alert) -> str:
        """Create plain text email body"""
        alert_name = alert.alert_type.value.replace('_', ' ').title()
        
        text = f"""
Smart Crop Irrigation System - Alert Notification

Alert Type: {alert_name}
Severity: {alert.severity.value.upper()}
Time: {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}

{alert.message}

Current Value: {alert.sensor_value}
Threshold: {alert.threshold_value}

Recommended Action:
{EmailService._get_recommendation(alert.alert_type)}

---
This is an automated alert from your Smart Crop Irrigation System.
Please take appropriate action to ensure optimal crop health.
        """
        return text.strip()
    
    @staticmethod
    def _create_alert_html(alert: Alert) -> str:
        """Create HTML email body"""
        alert_name = alert.alert_type.value.replace('_', ' ').title()
        severity_color = {
            "info": "#3b82f6",
            "warning": "#f59e0b",
            "critical": "#ef4444"
        }.get(alert.severity.value, "#6b7280")
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
        .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
        .alert-box {{ background: white; border-left: 4px solid {severity_color}; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .metric {{ display: inline-block; margin: 10px 20px 10px 0; }}
        .metric-label {{ font-size: 12px; color: #6b7280; text-transform: uppercase; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: {severity_color}; }}
        .recommendation {{ background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px; }}
        .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 Smart Crop Irrigation System</h1>
            <p>Alert Notification</p>
        </div>
        <div class="content">
            <div class="alert-box">
                <h2 style="color: {severity_color}; margin-top: 0;">⚠️ {alert_name}</h2>
                <p><strong>Severity:</strong> <span style="color: {severity_color}; text-transform: uppercase;">{alert.severity.value}</span></p>
                <p><strong>Time:</strong> {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                <p style="font-size: 16px; margin: 20px 0;">{alert.message}</p>
                
                <div style="margin: 20px 0;">
                    <div class="metric">
                        <div class="metric-label">Current Value</div>
                        <div class="metric-value">{alert.sensor_value}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Threshold</div>
                        <div class="metric-value">{alert.threshold_value}</div>
                    </div>
                </div>
            </div>
            
            <div class="recommendation">
                <h3 style="margin-top: 0; color: #1e40af;">💡 Recommended Action</h3>
                <p>{EmailService._get_recommendation(alert.alert_type)}</p>
            </div>
            
            <div class="footer">
                <p>This is an automated alert from your Smart Crop Irrigation System.</p>
                <p>Please take appropriate action to ensure optimal crop health.</p>
            </div>
        </div>
    </div>
</body>
</html>
        """
        return html.strip()
    
    @staticmethod
    def _get_recommendation(alert_type: AlertType) -> str:
        """Get recommendation based on alert type"""
        recommendations = {
            AlertType.SOIL_MOISTURE_LOW: "Soil moisture is below optimal level. Consider irrigating your crops to prevent water stress.",
            AlertType.SOIL_MOISTURE_HIGH: "Soil moisture is above optimal level. Reduce irrigation to prevent root rot and fungal diseases.",
            AlertType.TEMPERATURE_LOW: "Temperature is below optimal range. Consider using protective covers or moving plants to warmer location.",
            AlertType.TEMPERATURE_HIGH: "Temperature is above optimal range. Provide shade, increase ventilation, or relocate plants to cooler area.",
            AlertType.HUMIDITY_LOW: "Humidity is below optimal level. Increase misting or use humidifiers to prevent plant dehydration.",
            AlertType.HUMIDITY_HIGH: "Humidity is above optimal level. Improve air circulation to prevent fungal growth and diseases.",
            AlertType.LIGHT_INTENSITY_LOW: "Light intensity is insufficient. Move plants to brighter location or supplement with grow lights.",
            AlertType.LIGHT_INTENSITY_HIGH: "Light intensity is too high. Provide shade or move plants to prevent leaf burn and heat stress.",
        }
        return recommendations.get(alert_type, "Monitor the situation and take appropriate action based on crop requirements.")
