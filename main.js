/**
 * 【変更する必要がある場所が３箇所あるので注意】
 *  ① 変数 calendarID: カレンダーID
 *  ② 変数 TOKEN: Slackのユーザートークン
 *  ③ 変数 emoji_map: イベント名に対応した絵文字をつける(任意)
 */
function main() {
  /**
   * ① 監視対象にしたいカレンダーIDを入れる
   */
	const calendarID = "***";

	var dateTime = new Date();
	var status;
	// 対象のカレンダーからその日の予定を取得
	var events = CalendarApp.getCalendarById(calendarID).getEventsForDay(dateTime);
  // console.log(events);
	if (events.length == 0) {
		// イベントがなければ何も設定しない
		status = JSON.stringify({
			"profile": {
				"status_text": "",
				"status_emoji": ""
			}
		});
	} else {
		for (var i in events) {
			if (events[i].getEndTime() <= dateTime) continue; //既に終わっているものは無視
			if (events[i].getStartTime() <= dateTime) { //開始時間が前のものを対象
				status = identifyStatus(events[i]);
				console.log(status)
			} else { // その時間にイベントがなければステータスの内容をクリア
				status = JSON.stringify({
					"profile": {
						"status_text": "",
						"status_emoji": ""
					}
				});
			}
		}
	}
	postStatus(status);
}

function identifyStatus(event) {
	var event_title = event.getTitle();
  var expiration_time = Math.floor(event.getEndTime().getTime()/1000);
  var emoji = emoji_select(event_title);
  
  console.log(event_title)
  console.log(expiration_time)
  console.log(emoji)

  status = JSON.stringify({
    "profile": {
      "status_text": event_title,
      "status_emoji": emoji,
      "status_expiration": expiration_time,
    }
  });

	return status;
}

function emoji_select(event_title) {

  /**
   * ③ emoji_map の key に検索ワード, valueに絵文字のIDを入れると, 
   * イベント名の最初に引っかかった検索ワードに対応した絵文字のステータスになる
   */
  const emoji_map = {
    "ミーティング": "calling",
    "会議": "calling",
    "作業": "computer",
  };

  var emoji = ":thought_balloon:"; //初期値
  for (let key in emoji_map) {
    if (event_title.indexOf(key) > -1) {
      emoji = ":" + emoji_map[key] + ":";
      break;
    }
  }
  return emoji;
}

function postStatus(status) {
  /**
   * ② TOKEN にUser Tokenを貼り付ける
   */
	const TOKEN = "xoxp-xxx-xxx-xxx-xxx";

	// アクセス情報
	const URL = "https://slack.com/api/users.profile.set";
	// HTTPヘッダ設定
	const headers = {
		"Authorization" : "Bearer " + TOKEN,
		"Content-Type": "application/json; charset=utf-8"
	};
	// POSTデータを設定
	var post_data = {
		"headers": headers,
		"method": "POST",
		"payload": status
	};
	var fetch
	return fetch = UrlFetchApp.fetch(URL, post_data);
}