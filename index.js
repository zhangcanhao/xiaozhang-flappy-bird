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
	// 图片大小为600，小鸟大小为30，理应为570，但由于birdStepY是递增的，导致超过了570
	maxTop: 555,
	// 用于存放柱子的对数
	pipeLength: 7,
	// 存放一对一对的柱子
	pipeArr: [],
	// 最后一根柱子的索引
	// 总共七根柱子最后一根的索引就是6了
	pipeLastIndex: 6,
	// 定义初始分数
	score: 0,
	/**
	 * 初始化函数
	 */
	init: function () {
		this.initData();
		this.animate();
		this.handle();

		if (sessionStorage.getItem('play')) {
			this.start();
		}
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
		// 获取游戏结束分数元素
		this.oFinalScore = this.oEnd.getElementsByClassName('final-score')[0];
		// 获取用来存放排行榜的元素
		this.oRankList = this.oEnd.getElementsByClassName('rank-list')[0];
		// 获取重新开始的元素
		this.oRestart = this.oEnd.getElementsByClassName('restart')[0];
		// 定义一个数组来存放数据
		this.scoreArr = this.getScore();
		console.log(this.scoreArr);
	},
	/**
	 * 添加分数的数据
	 */
	serScore: function () {
		// 在scoreArr数组后添加score游戏分数和getDate时间
		this.scoreArr.push({
			score: this.score,
			time:this.getDate(),
		})

		this.scoreArr.sort(function (a, b) {
			return b.score - a.score;
		})
		// 将scoreArr存进local内
		setLocal('score', this.scoreArr);
	},
	/**
	 * 获取分数的数据来定义排行榜
	 */
	getScore: function () {
		// 键值不存在的情况下值为null
		var scoreArr = getLocal('score');
		// 获取到的值如果为五大假值'null undefined "" false 0'返回[]
		return scoreArr ? scoreArr : [];
	},
	/**
	 * 定义时间
	 */
	getDate: function () {
		// formatNum是在utils.js定义的工具个位数格式函数
		// date
		var d = new Date();
		// 年
		var year = d.getFullYear();
		// 月
		var month = formatNum(d.getMonth() + 1);
		// 日
		var day = formatNum(d.getDate());
		// 时
		var hour = formatNum(d.getHours());
		// 分
		var minute = formatNum(d.getMinutes());
		// 秒
		var secound = formatNum(d.getSeconds());

		// 拼接
		return `${year}.${month}.${day} ${hour}:${minute}:${secound}`;
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
			// 判断点击开始后调用的函数
			if (self.startFlag) {
				self.birdDrop();
				self.pipeMove();
			};
			// 因为.3毫秒过快，因此判断count除以10等于0的时候运行，也就是每十次运行一次，相当于3毫秒
			if (++ count % 10 === 0) {
				// 判断是否调用函数
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
	birdDrop: function () {
		// 小鸟的定位top = top + （birdStepY ++）
		this.birdTop += ++ this.birdStepY;
		// 再把top引入小鸟样式
		this.oBird.style.top = this.birdTop + 'px';
		// 调用碰撞检测
		this.judgeKnock();
		this.addScore();
	},
	/**
	 * 柱子移动
	 */
	pipeMove: function () {
		// 循环柱子的数量
		for (var i = 0; i < this.pipeLength; i ++) {
			// 把上柱子和下柱子引用进来
			var oUpPipe = this.pipeArr[i].up;
			var oDownPipe = this.pipeArr[i].down;
			// 定义x = 上柱子的left数值 为什么用offsetLeft定义 因为得出的没有px
			// 在跟父元素速度一样每.03s减去skyStep变量
			var x = oUpPipe.offsetLeft - this.skyStep;
			// 判断x < -52 就是说柱子刚好离开我们的可见视角时
			if (x < -52) {
				// 定义一个存放最后一个柱子的left数值变量
				var lassPipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
				// 把上柱子和下柱子的left等于刚获取的变量+300px
				// 意思就是放到最后一根柱子300px后的位置
				oUpPipe.style.left = lassPipeLeft + 300 + 'px';
				oDownPipe.style.left = lassPipeLeft + 300 + 'px';
				// 定义一个存放算法的变量 算出索引 最后一根柱子索引是6
				// ++的话就等于7 这时候摩柱子数量7 索引就等于0了 就回到第一根柱子了
				this.pipeLastIndex = ++ this.pipeLastIndex % this.pipeLength;
				// 获取随机高度对象
				var getPipeHeight = this.getPipeHeight();
				// 将返回的值引入达成一直切换随机高度
				oUpPipe.style.height = getPipeHeight.up + 'px';
				oDownPipe.style.height = getPipeHeight.down + 'px';
				// 返回数值
				continue;
			}
			// 引用进去
			oUpPipe.style.left = x + 'px';
			oDownPipe.style.left = x + 'px';
		}
	},
	/**
	 * 随机高度
	 */
	getPipeHeight: function () {
		var upHeight = 50 + Math.floor(Math.random() * 175);
		var downHeight = 600 - 150 - upHeight;
		// 返回up和down
		return {
			up: upHeight,
			down: downHeight,
		}
	},
	/**
	 * 碰撞检测
	 */
	judgeKnock: function () {
		// 调用边界碰撞和柱子碰撞
		this.judgeBoundary();
		this.jundgePipe();
	},
	/**
	 * 进行边界碰撞检测
	 */
	judgeBoundary: function () {
		// 判断小鸟掉落距离，上天和落地都会触发游戏结束
		// 判断birdtop小于0就是有没有上天 大于maxtop就是有没有落地+
		if (this.birdTop < this.minTop || this.birdTop > this.maxTop) {
			// 调用游戏结束
			this.failGame();
		};
		// console.log(this.maxTop);
		console.log(this.birdTop);
	},
	/**
	 * 进行柱子碰撞检测
	 */
	jundgePipe: function () {
		// 相遇 小鸟遇到柱子的时候lef=95px 小鸟略过柱子的时候  边界距离柱子为13px
		// 定义一个索引能够循环0-6
		var index = this.score % this.pipeLength;
		// 定义每根柱子距离left
		var pipeX = this.pipeArr[index].up.offsetLeft;
		// 定义柱子的高度
		var pipeY = this.pipeArr[index].y;
		// 定义小鸟的top飞行高度
		var birdY = this.birdTop;
		// 判断柱子距离左边刚好碰到小鸟和右边刚好经过小鸟或者小鸟碰到上边柱子或小鸟碰到下边柱子
		if ((pipeX <= 95 && pipeX >= 13) && (birdY <= pipeY[0] || birdY >= pipeY[1])) {
			// 结束游戏
			this.failGame();
		}
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
	/**
	 * 加分
	 */
	addScore: function () {
		// 定义索引
		var index = this.score % this.pipeLength;
		// 定义柱子X
		var pipeX = this.pipeArr[index].up.offsetLeft;

		// 判断经过柱子的时候
		if (pipeX < 13) {
			// 执行加分
			this.oScore.innerText = ++ this.score;
		}
	},
	/**
	 * 定义一个开始后调用函数的对象
	 */
	handle: function () {
		// 调用函数
		this.handleStart();
		this.handleClick();
		this.handleRestart();
	},
	/**
	 * 定义一个点击开始后的函数
	 */
	handleStart: function () {
		// 点击开始按钮
		this.oStart.onclick = this.start.bind(this);
	},
	start: function () {
		var self = this;
		// 调用函数关闭，动态函数都很耗性能，没用的关掉
		self.startFlag = true;
		// 小鸟飞到左边去
		self.oBird.style.left = '80px';
		// 取消小鸟的过度，过度需要.3s导致延迟提前触发结束
		self.oBird.style.transition = 'none';
		// 隐藏点击开始按钮
		self.oStart.style.display = 'none';
		// 显示分数元素
		self.oScore.style.display = 'block';
		// 背景移动加快
		self.skyStep = 5;
		// 创建柱子数量  for循环来循环出多少个数量的注册
		for (var i = 0; i < self.pipeLength; i ++) {
			// 调用注册并且定义left需要的x参数
			self.createPipe(300 * (i + 1));
		}
	},
	/**
	 * 点击父元素跳
	 */
	handleClick: function () {
		// 获取this
		var self = this;
		// 点击父元素，获取点击e
		self.el.onclick = function (e) {
			// dom.classList.contains('a');
			// 判断点击的是不是为start（点击开始按钮）如果不是的话则跳
			// 原因是点击开始的时候他就跳一下了
			if (!e.target.classList.contains('start')) {
				// 跳-10px
				self.birdStepY = -10;
			};
		};
	},
	/**
	 * 点击重新游戏重新开始
	 */
	handleRestart: function () {
		this.oRestart.onclick = function () {
			window.location.reload();
			sessionStorage.setItem('play', true);
		};
	},
	/**
	 * 构建柱子
	 */
	createPipe: function (x) {
		// var pipeHeight 0 - 1 600 - 150 = 450 / 2 = 225
		// 0 - 225 小数
		// Math.random是创建一个0-1的小数 floor是定义为整数 50 + 是为了让最小值不小于50， * 175是为了最大值不大于175
		// 因此得出50 - 175
		var upHeight = 50 + Math.floor(Math.random() * 175);
		// 600是父元素高度 150是柱子之间的间距 在减去上柱子就得出了下柱子的高度
		var downHeight = 600 - 150 - upHeight;

		// 调用untils.js的工具 创建上柱子和下柱子的div 并且定义高度和绝对定位的left
		var oUpPipe = createEle('div', ['pipe', 'pipe-up'], {
			height: upHeight + 'px',
			left: x + 'px',
		})
		var oDownPipe = createEle('div', ['pipe', 'pipe-down'], {
			height: downHeight + 'px',
			left: x + 'px',
		})
		console.log(oUpPipe);
		/**
		 * var oDiv = document.createElement('div');
		 * oDiv.classList.add('pipe');
		 * oDiv.classList.add('pipe-up');
		 * oDiv.style.height = upHeight + 'px';
		 */
		// 引用上柱子和下柱子
		this.el.appendChild(oUpPipe);
		this.el.appendChild(oDownPipe);

		// 在柱子数组后面定义up = 上柱子 down = 下柱子 y = 上柱子高度和上柱子 + 150px高度
		this.pipeArr.push({
			up: oUpPipe,
			down: oDownPipe,
			y: [upHeight, upHeight + 150],
		})
	},
	/**
	 * 结束游戏
	 */
	failGame: function () {
		// 关闭定时器
		clearInterval(this.timer);
		// 隐藏与显示
		this.oMask.style.display = "block";
		this.oEnd.style.display = "block";
		this.oBird.style.display = "none";
		this.oScore.style.display = "none";
		// 结束时候显示的分数等于游戏中获取的分数
		this.oFinalScore.innerText = this.score;
		// 调用添加数据的函数
		this.serScore();
		this.renderRankList();
	},
	/**
	 * 创建排行榜列表list
	 */
	renderRankList: function () {
		// 定义一个拼接的空变量
		var template = '';
		// 循环出排行榜
		for (var i = 0; i < 8; i ++) {
			// 定义一个排行榜前三名的class名
			var degreeClass = '';
			// 循环下三个数
			switch (i) {
				case 0:
					degreeClass = 'first';
					break;
				case 1:
					degreeClass = 'second';
					break;
				case 2:
					degreeClass = 'third';
					break;
			}
			// 使用拼接变量拼接html并将变量值放进去
			 template += `
			 <!-- 排行榜每一列 -->
          <li class="rank-item">
            <!-- 排行名次 -->
            <span class="rank-degree ${degreeClass}">${i + 1}</span>
            <!-- 排行榜分数 -->
            <span class="rank-score">${this.scoreArr[i].score}</span>
            <span class="rank-time">${this.scoreArr[i].time}</span>
          </li>
			 `
		}
		// 将拼接结果放进标签完成实现
		this.oRankList.innerHTML = template;
	},
};
