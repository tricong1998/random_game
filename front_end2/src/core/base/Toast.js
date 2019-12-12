const Toast = {
  alertHide: (message, time, level, title) => {
    window.vueApp.$bvToast.toast(message, {
      title: title,
      autoHideDelay: time,
      variant: level
    });
  }
}

export default Toast;