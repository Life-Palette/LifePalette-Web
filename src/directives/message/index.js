const handleLinkData = function (values) {
  let str = values;
  const reg =
    /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
  let url = values.match(reg);
  if (url) {
    url.forEach((item) => {
      str = str.replace(item, `<a href="${item}" target="_blank">${item}</a>`);
    });
  }
  return str;
};

export const message = {
  updated(el, binding) {
    // console.log("🐠-----el-----", el, binding);
    const { value } = binding;
    if (!value) return;
    const conVal = handleLinkData(value);
    el.innerHTML = conVal;
  },
};
