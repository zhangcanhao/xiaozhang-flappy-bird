/**
 * utils.js是一个工具文件，用于团队开发时共用的一个工具盒
 * 里边放的就一些可以调用的函数或者方法
 * @param {定义的标签名字} eleName 
 * @param {定义的class数组} chassArr 
 * @param {定义的样式对象} styleObj 
 */
// 这是一个创建柱子的工具
function createEle (eleName, chassArr, styleObj) {
	var dom = document.createElement(eleName);

	for (var i = 0; i < chassArr.length; i ++) {
		dom.classList.add(chassArr[i]);
	}

	for (var key in styleObj) {
		dom.style[key] = styleObj[key];
	}

	return dom;
}

/**
 * 本地存储和获取
 */

function setLocal (key, value) {
	if (typeof value === 'object' && value !== null) {
		value = JSON.stringify(value);
	}
	localStorage.setItem(key, value);
}

function getLocal (key) {
	var value = localStorage.getItem(key);
	if (value === null) { return value};
	if (value[0] === '[' || value[0] === '{') {
		return JSON.parse(value);
	}
	return value;
}

/**
 * 接收时间个位数格式
 */

 function formatNum (num) {
	 if (num < 10) {
		 return '0' + num;
	 }
	 return num;
 }