export interface OrderNotificationData {
  id: number;
  type: string;
  name: string;
  phone: string;
  comment?: string | null;
  detailsJson: string; // JSON with selected elements/colors or product details
  status: string;
  createdAt: Date;
}

export async function sendTelegramNotification(order: OrderNotificationData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  let detailsText = '';
  try {
    const details = JSON.parse(order.detailsJson);
    if (order.type === 'customizer') {
      // Configuration details
      const elementsList = details.elements ? details.elements.join(', ') : 'Не обрано';
      const color = details.color ? details.color : 'Не обрано';
      const price = details.price ? `${details.price} ₴` : '0 ₴';
      detailsText = `🔧 *Деталі конфігурації*:\n- *Елементи*: ${elementsList}\n- *Колір*: ${color}\n- *Ціна*: ${price}`;
    } else if (order.type === 'order') {
      // Direct catalog order details
      const productName = details.productName || 'Невідомий товар';
      const productPrice = details.price ? `${details.price} ₴` : '';
      const qty = details.quantity || 1;
      detailsText = `🛒 *Товар*: ${productName}\n- *Кількість*: ${qty}\n- *Ціна*: ${productPrice}`;
    } else if (order.type === 'callback') {
      // Callback request
      const topic = details.interestTopic || 'Загальне питання';
      const how = details.contactMethod || 'Зателефонувати';
      detailsText = `📞 *Тема*: ${topic}\n- *Спосіб зв'язку*: ${how}`;
    }
  } catch (error) {
    detailsText = `Error parsing details: ${order.detailsJson}`;
  }

  const messageText = `
🔔 *Нова заявка №${order.id} на сайті Apex Force!*

*Тип*: ${order.type === 'callback' ? 'Зворотний дзвінок' : order.type === 'customizer' ? 'Конструктор' : 'Замовлення товару'}
*Ім'я*: ${order.name}
*Телефон*: ${order.phone}
${order.comment ? `*Коментар*: ${order.comment}\n` : ''}
${detailsText}

*Статус*: ${order.status}
*Дата*: ${order.createdAt.toLocaleString('uk-UA')}
  `.trim();

  // If environment variables are missing, output to log
  if (!token || !chatId) {
    console.log('---------------- TELEGRAM NOTIFICATION (UNCONFIGURED) ----------------');
    console.log(messageText);
    console.log('---------------------------------------------------------------------');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Telegram Bot API error: ${response.status} - ${errText}`);
    } else {
      console.log(`Telegram notification for Order #${order.id} sent successfully.`);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
