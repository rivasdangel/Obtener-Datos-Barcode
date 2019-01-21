/**
 * Created by @Jakofff
 */

var time = function(){
	var cur = new Date();
	var res = cur.getDate() + '-' + (cur.getMonth()==11?12:(cur.getMonth()+1)) + '-' + cur.getFullYear() + ' ' + cur.getHours() + ':' + cur.getMinutes() + ':' + cur.getSeconds() + ' ';
	return res;
}

module.exports = {
	time: time
}