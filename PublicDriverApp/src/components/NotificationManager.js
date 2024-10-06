import { Toast, Dialog } from 'react-native-alert-notification';

const showNotification = (title, message, type = 'success', duration = 3000, toastType = "toast",closebtnText= 'close') => {
  {
    toastType === "toast" ? Toast.show({
      type: type.toUpperCase(),
      title,
      textBody: message,
      autoClose: duration,
    }) : Dialog.show({
      type: type.toUpperCase(),
      title,
      textBody: message,
      button: closebtnText,
      autoClose: duration,
    })
  }
};

export { showNotification };