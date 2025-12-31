import { Toast, Dialog } from 'react-native-alert-notification';
import { Fonts } from '../../constants/constants';

const showNotification = (title, message, type = 'success', duration = 3000, toastType = "toast",closebtnText= 'Close') => {
  {
    toastType === "toast" ? Toast.show({
      type: type.toUpperCase(),
      title,
      textBody: message,
      autoClose: duration,
      titleStyle:{
        fontFamily: Fonts.semi_bold,
      },
      textBodyStyle:{
        fontFamily: Fonts.regular,
      }
    }) : Dialog.show({
      type: type.toUpperCase(),
      title,
      textBody: message,
      button: closebtnText,
      autoClose: duration,
      titleStyle:"center"
    })
  }
};

export { showNotification };
