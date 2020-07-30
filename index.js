// 利用对象收编变量
// 全局变量，键值对
/** 为了避免团队开发的时候，全局变量的name一样导致页面崩塌
 * 例如：var a = 10;var b = 100;
 *  改成: var obj { var a = 10, var b = 100;};
 * 一切都写到对象数组内，这样会把对象name的冲突几率降到最低，并且就算冲突了也能快速找到 */ 
// 单一执行原则，一个函数只管一个事情

// 动画 animate 去管理所有动画函数
var bird = {
	// 移动背景图片的初始值
	skyPosition: 0,
	// 移动背景图片速度快慢的初始值
	skyStep: 2,
	// 小鸟蹦的初始值
	birdTop: 220,
	// 小鸟落的重力初始值
	birdStepY: 0,
	// 定义开始游戏效果的颜色条件
	startColor: 'blue',
	// 定义一个调用函数的开关
	startFlag: false,
	// 定义小鸟上升的最高位置
	minTop: 0,
	// 定义小鸟掉落的最低位置
	maxTop: 555,
	/**
	 * 初始化函数
	 */
	init: function () {
		this.initData();
		this.animate();
		this.handle();
	},
	/**
	 * initData 初始化数据  把所有要去拿到的数据都放到initData来集中管理
	 */
	initData: function () {
		// 获取父元素
		this.el = document.getElementById('game');
		// 获取小鸟元素，为了避免团队合作时classname冲突，因此document文档获取改成this.el父元素内获取
		this.oBird = this.el.getElementsByClassName('bird')[0];
		// 获取点击开始元素
		this.oStart = this.el.getElementsByClassName('start')[0];
		// 获取分数元素
		this.oScore = this.el.getElementsByClassName('score')[0];
		// 获取模态框元素
		this.oMask = this.el.getElementsByClassName('mask')[0];
		// 获取结束游戏元素
		this.oEnd = this.el.getElementsByClassName('end')[0];
		// console.log(oBird);
	},
	/**
	 * 管理动画
	 */
	animate: function () {
		// this === bird
		// 设置调用birdJump条件的初始值
		var count = 0;
		// 设置定时器内的this
		var self = this;
		// 为了不让页面的定时器过多导致浏览器无法承载，因此注释了其他定时器改用定时器共用
		this.timer = setInterval( function () {
			// 定时器内的this === window 所以先在外边获取到this在使用
			// 调用skyMove
			self.skyMove();
			if (self.startFlag) {
				self.birdDrop();
			};
			// 因为.3毫秒过快，因此判断count除以10等于0的时候运行，也就是每十次运行一次，相当于3毫秒
			if (++ count % 10 === 0) {
				if (!self.startFlag) {
					self.birdJump();
					self.startBound();
				}
				// 给他一个计数的变量
				self.birdFly(count);
			};
		}, 30);
	},
	/**
	 * 天空移动
	 */
	skyMove: function () {
		// 定时器：每隔.3毫秒就移动一次图片达成动画效果
		// setInterval(function () {
		// 移动背景图片skyPosition = skyPosition - skyStep
		// 基础知识：为什么图片走不完，因为图片默认是重复的repeat，如果设置no-repeat图片就直接走完了
		this.skyPosition -= this.skyStep;
		// 背景图片定位X每隔30毫秒-2px
		this.el.style.backgroundPositionX = this.skyPosition + 'px';
		// }, 30)
	},
	/**
	 * 小鸟蹦跶
	 */
	birdJump: function () {
		// 定时器：每隔3毫秒就移动一次小鸟
		// setInterval(function () {
		// 小鸟动画原因是css内的bird加了过度样式
		// 判断当birdTop为220的时候变成260为260的时候变成220
		this.birdTop = this.birdTop === 220 ? 260 : 220;
		// 获取小鸟更改top样式为birdTop px
		this.oBird.style.top = this.birdTop + 'px';
		// }, 300)
	},
	/**
	 * 小鸟飞呀
	 */
	birdFly: function (count) {
		// 更改小鸟图片的图片定位，用给到的计数变量摩3(得到的只有0,1,2)乘-30px(图片宽90px)，0，-30px，-60px切换
		this.oBird.style.backgroundPositionX = count % 3 * -30 + 'px';
	},
	/**
	 * 小鸟落
	 */
	birdDrop: function() {
		this.birdTop += ++ this.birdStepY;
		this.oBird.style.top = this.birdTop + 'px';
		this.judgeKnock();
	},
	/**
	 * 碰撞检测
	 */
	judgeKnock: function() {
		this.judgeBoundary();
		this.jundgePipe();
	},
	/**
	 * 进行边界碰撞检测
	 */
	judgeBoundary: function() {
		// 判断小鸟掉落距离，上天和落地都会触发游戏结束
		// 判断birdtop小于0就是有没有上天 大于maxtop就是有没有落地+
		if (this.birdTop < this.minTop || this.birdTop > this.maxTop) {
			// 调用游戏结束
			this.failGame();
		};
		console.log(this.maxTop);
		console.log(this.birdTop)
	},
	/**
	 * 进行柱子碰撞检测
	 */
	jundgePipe: function () {

	},
	/**
	 * 开始游戏效果
	 */
	startBound: function () {
		// 定义上一个类的变量
		var prevColor = this.startColor;
		// 用三位运算符判断条件
		this.startColor = prevColor === 'blue' ? 'white' : 'blue';
		// 替换获取到的元素的类
		this.oStart.classList.remove('start-' + prevColor);
		this.oStart.classList.add('start-' + this.startColor)
	/**
	 * 旧版逻辑 原理 两个颜色一直切换
	 * 定义存上一个颜色的变量
	 * var color;
	 * 判断startColor全等blue的时候
	 * if (this.startColor === 'blue') {
	 * color等于white
	 * 	color = 'white';
	 * 否则等于blue
	 * } else {
	 * 	color = 'blue';
	 * }
	 * 在移除上一个颜色换成另一个颜色
	 * classList.remove('start-' + this.startColor);
	 * classList.add('start-' + color);
	 * 最后吧color复制给startColor使下一次判断合理切换
	 * this.startColor = color; 
	*/
	},
	// 定义一个开始后调用函数的对象
	handle: function () {
		// 调用函数
		this.handleStart();
	},
	// 定义一个点击开始后的函数
	handleStart: function () {
		// this
		var self = this;
		// 点击开始按钮
		this.oStart.onclick = function () {
			// 调用函数关闭，动态函数都很耗性能，没用的关掉
			self.startFlag = true;
			// 小鸟飞到左边去
			self.oBird.style.left = '80px';
			// 隐藏点击开始按钮
			self.oStart.style.display = 'none';
			// 显示分数元素
			self.oScore.style.display = 'block';
			// 背景移动加快
			self.skyStep = 5;
		};
	},

	/**
	 * 结束游戏
	 */
	failGame: function() {
		//关闭定时器
		clearInterval(this.timer);
		this.oMask.style.display = "block";
		this.oEnd.style.display = "block";
		this.oBird.style.display = "none";
		this.oScore.style.display = "none";
	},
};
