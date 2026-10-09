import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderTeamCards} from './src/teams.js';
test('Bốn thẻ số tổ hiển thị chức vụ và tên thành viên an toàn, không dùng ảnh',()=>{
 const c=JSON.parse(readFileSync(new URL('../backend/content/teams.json',import.meta.url),'utf8'));
 c.items[0].leader='Anh Trưởng';c.items[0].deputy='Anh Phó';c.items[0].members=['Nguyễn Văn A','<img src=x onerror=alert(1)>'];
 const html=renderTeamCards(c.items.toReversed(),c.labels);
 assert.equal((html.match(/<article /g)||[]).length,4);assert.equal((html.match(/class="team-number"/g)||[]).length,4);
 assert.ok(html.indexOf('Tổ 1')<html.indexOf('Tổ 4'));assert.ok(html.includes('Tổ trưởng'));assert.ok(html.includes('Tổ phó'));assert.ok(html.includes('Anh Trưởng'));assert.ok(html.includes('Anh Phó'));assert.ok(html.includes('Nguyễn Văn A'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));assert.ok(html.includes('Chưa cập nhật'));
});
