<template>
  <div :class="$style.div">
    <div :class="$style.app">
      <div :class="$style.scaledscreen">
        <div :class="$style.demo">
          <div :class="$style.container">
            <div :class="$style.container2">
              <div :class="$style.text">
                <b :class="$style.b">问</b>
              </div>
            </div>
            <div :class="$style.container3">
              <div :class="$style.container4">
                <b :class="$style.a">答题分析</b>
              </div>
              <div :class="$style.containerMargin">
                <div :class="$style.container4">
                  <div :class="$style.div2">单选题 · 第 1 题</div>
                </div>
              </div>
            </div>
          </div>
          <div :class="$style.container6">
            <div :class="$style.container7">
              <div :class="$style.container8">
                <div :class="$style.container9">
                  <div :class="$style.container10">
                    <b :class="$style.b3">1</b>
                  </div>
                  <div :class="$style.container11">
                    <div :class="$style.div3">单选题 · 2分</div>
                  </div>
                </div>
                <div :class="$style.containerMargin2">
                  <div :class="$style.container4">
                    <b :class="$style.whichSentenceUsesContainer">
                      <span :class="$style.whichSentenceUses"
                        >Which sentence uses the
                      </span>
                      <span :class="$style.presentPerfectTense"
                        >present perfect tense</span
                      >
                      <span :class="$style.whichSentenceUses"> correctly?</span>
                    </b>
                  </div>
                </div>
                <div :class="$style.container13">
                  <div :class="$style.container14">
                    <div :class="$style.container15">
                      <b :class="$style.a">A</b>
                    </div>
                    <div :class="$style.text2">
                      <div :class="$style.sheHasWent">
                        She has went to Paris last year.
                      </div>
                    </div>
                  </div>
                  <div :class="$style.container14">
                    <div :class="$style.container15">
                      <b :class="$style.a">B</b>
                    </div>
                    <div :class="$style.text3">
                      <div :class="$style.iHaveNever">
                        I have never eat sushi before.
                      </div>
                    </div>
                  </div>
                  <div :class="$style.container14">
                    <div :class="$style.container15">
                      <b :class="$style.a">C</b>
                    </div>
                    <div :class="$style.text4">
                      <div :class="$style.theyHaveVisited">
                        They have visited the museum three times.
                      </div>
                    </div>
                  </div>
                  <div :class="$style.container14">
                    <div :class="$style.container15">
                      <b :class="$style.a">D</b>
                    </div>
                    <div :class="$style.text5">
                      <div :class="$style.heHasGo">
                        He has go to school this morning.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div :class="$style.container22">
              <div :class="$style.container23">
                <div :class="$style.containerMargin3">
                  <div :class="$style.container24">
                    <div :class="$style.container25">
                      <div :class="$style.container26">
                        <b :class="$style.b5">28</b>
                      </div>
                      <div :class="$style.container27">
                        <div :class="$style.div4">已作答</div>
                      </div>
                    </div>
                    <div :class="$style.container28">
                      <div :class="$style.container26">
                        <b :class="$style.b5">30</b>
                      </div>
                      <div :class="$style.container27">
                        <div :class="$style.div4">全班人数</div>
                      </div>
                    </div>
                    <div :class="$style.container31">
                      <div :class="$style.container26">
                        <b :class="$style.b5">27%</b>
                      </div>
                      <div :class="$style.container33">
                        <div :class="$style.div4">正确率</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div :class="$style.container34">
                <div :class="$style.container35">
                  <div :class="$style.container36" />
                  <div :class="$style.text6">
                    <b :class="$style.b8">作答分布</b>
                  </div>
                </div>
                <div :class="$style.container37">
                  <div :class="$style.container38">
                    <div :class="$style.container39">
                      <div :class="$style.container40">
                        <b :class="$style.a2">A</b>
                      </div>
                      <div :class="$style.container41">
                        <div :class="$style.container42" />
                      </div>
                      <div :class="$style.container43">
                        <div :class="$style.text7">
                          <b :class="$style.b9">8人</b>
                        </div>
                        <div :class="$style.text8">
                          <div :class="$style.div7">27%</div>
                        </div>
                      </div>
                      <img :class="$style.icon" alt="" />
                    </div>
                  </div>
                  <div :class="$style.container4">
                    <div :class="$style.container39">
                      <div :class="$style.container40">
                        <b :class="$style.a2">B</b>
                      </div>
                      <div :class="$style.container41">
                        <div :class="$style.container48" />
                      </div>
                      <div :class="$style.container43">
                        <div :class="$style.text7">
                          <b :class="$style.b9">5人</b>
                        </div>
                        <div :class="$style.text8">
                          <div :class="$style.div7">17%</div>
                        </div>
                      </div>
                      <img :class="$style.icon" alt="" />
                    </div>
                  </div>
                  <div :class="$style.container4">
                    <div :class="$style.container39">
                      <div :class="$style.container40">
                        <b :class="$style.a2">C</b>
                      </div>
                      <div :class="$style.container41">
                        <div :class="$style.container54" />
                      </div>
                      <div :class="$style.container43">
                        <div :class="$style.text11">
                          <b :class="$style.b12">12人</b>
                        </div>
                        <div :class="$style.text8">
                          <div :class="$style.div7">40%</div>
                        </div>
                      </div>
                      <img :class="$style.icon" alt="" />
                    </div>
                  </div>
                  <div :class="$style.container4">
                    <div :class="$style.container39">
                      <div :class="$style.container40">
                        <b :class="$style.a2">D</b>
                      </div>
                      <div :class="$style.container41">
                        <div :class="$style.container60" />
                      </div>
                      <div :class="$style.container43">
                        <div :class="$style.text7">
                          <b :class="$style.b9">3人</b>
                        </div>
                        <div :class="$style.text8">
                          <div :class="$style.div7">10%</div>
                        </div>
                      </div>
                      <img :class="$style.icon" alt="" />
                    </div>
                  </div>
                  <div :class="$style.container62">
                    <div :class="$style.container39">
                      <div :class="$style.container40">
                        <b :class="$style.a2">未答</b>
                      </div>
                      <div :class="$style.container41">
                        <div :class="$style.container66" />
                      </div>
                      <div :class="$style.container43">
                        <div :class="$style.text7">
                          <b :class="$style.b9">2人</b>
                        </div>
                        <div :class="$style.text16">
                          <div :class="$style.div11">7%</div>
                        </div>
                      </div>
                      <img :class="$style.icon" alt="" />
                    </div>
                  </div>
                </div>
                <div :class="$style.container68">
                  <div :class="$style.container69">
                    <div :class="$style.container70" />
                    <div :class="$style.text17">
                      <div :class="$style.div12">正确选项</div>
                    </div>
                  </div>
                  <div :class="$style.container69">
                    <div :class="$style.container72" />
                    <div :class="$style.text17">
                      <div :class="$style.div12">错误选项</div>
                    </div>
                  </div>
                  <div :class="$style.container69">
                    <div :class="$style.container74" />
                    <div :class="$style.text19">
                      <div :class="$style.div12">未作答</div>
                    </div>
                  </div>
                </div>
                <div :class="$style.containerMargin4">
                  <div :class="$style.container69">
                    <img :class="$style.icon6" alt="" />
                    <div :class="$style.text20">
                      <div :class="$style.div12">
                        点击选项可以查看作答学生名单
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div :class="$style.container76">
            <div :class="$style.aisimilarbtn">
              <img :class="$style.icon7" alt="" />
              <div :class="$style.text21">
                <b :class="$style.ai">AI相似题</b>
              </div>
            </div>
            <div :class="$style.container77">
              <div :class="$style.container78">
                <b :class="$style.b16">重设答案</b>
              </div>
              <div :class="$style.ctrldividerMargin">
                <div :class="$style.ctrldivider" />
              </div>
              <div :class="$style.btncompress">
                <img :class="$style.icocompressIcon" alt="" />
                <div :class="$style.text22">
                  <b :class="$style.b8">缩屏</b>
                </div>
              </div>
              <div :class="$style.btnminimize">
                <img :class="$style.icominusIcon" alt="" />
              </div>
              <div :class="$style.btnclose">
                <img :class="$style.icominusIcon" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style module>
.div {
  width: 100%;
  height: 1080px;
  position: relative;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  font-size: 17.98px;
  color: #fff;
  font-family: "Microsoft YaHei";
}
.app {
  width: 1918px;
  height: 1080px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.scaledscreen {
  align-self: stretch;
  height: 1078.9px;
  position: relative;
  background-color: #eaeae8;
  overflow: hidden;
  flex-shrink: 0;
}
.demo {
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: #f5f6f7;
  width: 1918px;
  height: 1078.9px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.container {
  align-self: stretch;
  height: 55.9px;
  box-shadow:
    0px 0.9989579916000366px 3px rgba(0, 0, 0, 0.04),
    0px 1.9979159832000732px 7.99px rgba(0, 0, 0, 0.04);
  background-color: #fff;
  border-bottom: 1px solid #dfe6e9;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0px 55.9px;
  gap: 16px;
}
.container2 {
  height: 36px;
  width: 36px;
  border-radius: 9.99px;
  background-color: #5b9f8a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.text {
  height: 27px;
  width: 18px;
  position: relative;
}
.b {
  position: absolute;
  top: -1px;
  left: 0px;
  line-height: 26.97px;
}
.container3 {
  width: 90.9px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 15.98px;
  color: #1a1f24;
}
.container4 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.containerMargin {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1px 0px 0px;
  font-size: 12.99px;
  color: #95a5a6;
}
.div2 {
  position: relative;
  line-height: 19.48px;
  flex-shrink: 0;
}
.container6 {
  align-self: stretch;
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  font-size: 19.98px;
}
.container7 {
  align-self: stretch;
  flex: 1;
  background-color: #fdfcf8;
  border-right: 1px solid #efeae1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.container8 {
  align-self: stretch;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 51.9px 79.9px;
}
.container9 {
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: 14px;
}
.container10 {
  height: 47.9px;
  width: 47.9px;
  box-shadow:
    0px 1.9979159832000732px 11.99px rgba(0, 0, 0, 0.06),
    0px 3.9958319664001465px 19.98px rgba(0, 0, 0, 0.04);
  border-radius: 13.99px;
  background-color: #5b9f8a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.b3 {
  position: relative;
  line-height: 29.97px;
}
.container11 {
  height: 20px;
  width: 73.9px;
  position: relative;
  font-size: 12.99px;
  color: #95a5a6;
}
.div3 {
  position: absolute;
  top: 0.25px;
  left: -0.23px;
  letter-spacing: 0.5px;
  line-height: 19.48px;
}
.containerMargin2 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px 0px 0px;
  font-size: 23.97px;
  color: #1a1f24;
}
.whichSentenceUsesContainer {
  position: relative;
  line-height: 40.76px;
}
.whichSentenceUses {
  line-height: 40.76px;
}
.presentPerfectTense {
  color: #4a8a78;
  line-height: 40.76px;
}
.container13 {
  width: 1197.8px;
  height: 391.6px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 47.9px 0px 0px;
  box-sizing: border-box;
  gap: 16px;
  font-size: 15.98px;
  color: #4a5568;
  font-family: Consolas;
}
.container14 {
  align-self: stretch;
  border-radius: 15.98px;
  background-color: #fff;
  border: 1px solid #dfe6e9;
  display: flex;
  align-items: center;
  padding: 18px 24px;
  gap: 18px;
}
.container15 {
  height: 36px;
  width: 36px;
  border-radius: 9.99px;
  background-color: #f5f6f7;
  display: flex;
  align-items: center;
  justify-content: center;
}
.a {
  position: relative;
  line-height: 23.97px;
}
.text2 {
  height: 27px;
  width: 261.7px;
  position: relative;
  font-size: 17.98px;
  color: #2d3436;
  font-family: "Microsoft YaHei";
}
.sheHasWent {
  position: absolute;
  top: -1px;
  left: -0.22px;
  line-height: 26.97px;
  flex-shrink: 0;
}
.text3 {
  height: 27px;
  width: 250.7px;
  position: relative;
  font-size: 17.98px;
  color: #2d3436;
  font-family: "Microsoft YaHei";
}
.iHaveNever {
  position: absolute;
  top: -1px;
  left: -0.14px;
  line-height: 26.97px;
  flex-shrink: 0;
}
.text4 {
  height: 27px;
  width: 367.6px;
  position: relative;
  font-size: 17.98px;
  color: #2d3436;
  font-family: "Microsoft YaHei";
}
.theyHaveVisited {
  position: absolute;
  top: -1px;
  left: 0.07px;
  line-height: 26.97px;
}
.text5 {
  height: 27px;
  width: 290.7px;
  position: relative;
  font-size: 17.98px;
  color: #2d3436;
  font-family: "Microsoft YaHei";
}
.heHasGo {
  position: absolute;
  top: -1px;
  left: -0.21px;
  line-height: 26.97px;
  flex-shrink: 0;
}
.container22 {
  width: 559.4px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: center;
  font-size: 25.97px;
  color: #5b9f8a;
  font-family: Consolas;
}
.container23 {
  align-self: stretch;
  border-bottom: 1px solid #f5f6f7;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 28px 40px 20px;
}
.containerMargin3 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 0px 12px;
}
.container24 {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.container25 {
  flex: 1;
  border-radius: 13.99px;
  background-color: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 16px;
}
.container26 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.b5 {
  position: relative;
  line-height: 38.96px;
}
.container27 {
  width: 119.2px;
  height: 21px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 0px 0px;
  box-sizing: border-box;
  font-size: 11.99px;
  color: #7f8c8d;
  font-family: "Microsoft YaHei";
}
.div4 {
  position: relative;
  line-height: 17.98px;
}
.container28 {
  flex: 1;
  border-radius: 13.99px;
  background-color: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 16px;
  color: #4a5568;
}
.container31 {
  flex: 1;
  border-radius: 13.99px;
  background-color: #ebf7f3;
  border: 1px solid #e0ede4;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 16px;
  color: #4a8a78;
}
.container33 {
  width: 119.2px;
  height: 21px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 0px 0px;
  box-sizing: border-box;
  font-size: 11.99px;
  font-family: "Microsoft YaHei";
}
.container34 {
  align-self: stretch;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px 40px;
  text-align: left;
  font-size: 14.98px;
  color: #2d3436;
  font-family: "Microsoft YaHei";
}
.container35 {
  width: 479.5px;
  height: 43px;
  display: flex;
  align-items: center;
  padding: 0px 0px 20px;
  box-sizing: border-box;
  gap: 8px;
}
.container36 {
  height: 16px;
  width: 4px;
  position: relative;
  border-radius: 2px;
  background-color: #5b9f8a;
}
.text6 {
  height: 23px;
  width: 59.9px;
  position: relative;
}
.b8 {
  position: absolute;
  top: 0.25px;
  left: 0px;
  line-height: 22.48px;
}
.container37 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  color: #d9827b;
  font-family: Consolas;
}
.container38 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #27ae60;
}
.container39 {
  border-radius: 9.99px;
  display: flex;
  align-items: center;
  padding: 4px 0px;
  gap: 12px;
}
.container40 {
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.a2 {
  position: relative;
  line-height: 22.48px;
}
.container41 {
  height: 32px;
  flex: 1;
  border-radius: 7.99px;
  background-color: #fafbfc;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.container42 {
  width: 132.9px;
  height: 32px;
  position: relative;
  box-shadow: 0px 3.9958319664001465px 11.99px rgba(39, 174, 96, 0.25);
  border-radius: 7.99px;
  background-color: #27ae60;
}
.container43 {
  width: 71.9px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 15.98px;
  color: #2d3436;
}
.text7 {
  width: 26px;
  height: 24px;
  position: relative;
}
.b9 {
  position: absolute;
  top: -1px;
  left: 0.1px;
  line-height: 23.97px;
}
.text8 {
  width: 20px;
  height: 18px;
  position: relative;
  font-size: 11.99px;
  color: #95a5a6;
}
.div7 {
  position: absolute;
  top: 0px;
  left: 0.09px;
  line-height: 17.98px;
}
.icon {
  height: 16px;
  width: 16px;
  position: relative;
}
.container48 {
  width: 82.9px;
  height: 32px;
  position: relative;
  border-radius: 7.99px;
  background-color: #d9827b;
}
.container54 {
  width: 199.8px;
  height: 32px;
  position: relative;
  border-radius: 7.99px;
  background-color: #d9827b;
}
.text11 {
  width: 35px;
  height: 24px;
  position: relative;
}
.b12 {
  position: absolute;
  top: -1px;
  left: 0.2px;
  line-height: 23.97px;
}
.container60 {
  width: 49.9px;
  height: 32px;
  position: relative;
  border-radius: 7.99px;
  background-color: #d9827b;
}
.container62 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #95a5a6;
}
.container66 {
  width: 33px;
  height: 32px;
  position: relative;
  border-radius: 7.99px;
  background-color: #b2bec3;
}
.text16 {
  width: 13px;
  height: 18px;
  position: relative;
  font-size: 11.99px;
  color: #95a5a6;
}
.div11 {
  position: absolute;
  top: 0px;
  left: -0.11px;
  line-height: 17.98px;
}
.container68 {
  width: 479.5px;
  height: 38px;
  display: flex;
  align-items: flex-start;
  padding: 20px 0px 0px;
  box-sizing: border-box;
  gap: 20px;
  font-size: 11.99px;
  color: #7f8c8d;
}
.container69 {
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: 6px;
}
.container70 {
  height: 10px;
  width: 10px;
  position: relative;
  border-radius: 3px;
  background-color: #27ae60;
}
.text17 {
  height: 18px;
  width: 47.9px;
  position: relative;
}
.div12 {
  position: absolute;
  top: 0px;
  left: 0px;
  line-height: 17.98px;
}
.container72 {
  height: 10px;
  width: 10px;
  position: relative;
  border-radius: 3px;
  background-color: #d9827b;
}
.container74 {
  height: 10px;
  width: 10px;
  position: relative;
  border-radius: 3px;
  background-color: #b2bec3;
}
.text19 {
  height: 18px;
  width: 36px;
  position: relative;
}
.containerMargin4 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 0px 0px;
  font-size: 11.99px;
  color: #95a5a6;
}
.icon6 {
  height: 14px;
  width: 14px;
  position: relative;
}
.text20 {
  height: 18px;
  width: 167.8px;
  position: relative;
}
.container76 {
  align-self: stretch;
  height: 79.9px;
  box-shadow: 0px -1.9979159832000732px 11.99px rgba(0, 0, 0, 0.04);
  background-color: #fff;
  border-top: 1px solid #dfe6e9;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 47.9px;
  gap: 20px;
  font-size: 13.99px;
  color: #4a5568;
}
.aisimilarbtn {
  height: 44px;
  border-radius: 11.99px;
  background-color: #fff;
  border: 1px solid #dfe6e9;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0px 20px;
  gap: 8px;
}
.icon7 {
  height: 18px;
  width: 18px;
  position: relative;
}
.text21 {
  height: 21px;
  width: 56.9px;
  position: relative;
}
.ai {
  position: absolute;
  top: 0px;
  left: -0.12px;
  line-height: 20.98px;
}
.container77 {
  width: 424.6px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 16.98px;
  color: #fff;
}
.container78 {
  height: 55.9px;
  box-shadow: 0px 7.991663932800293px 19.98px rgba(91, 159, 138, 0.32);
  border-radius: 15.98px;
  background-color: #5b9f8a;
  display: flex;
  align-items: center;
  padding: 0px 28px;
  box-sizing: border-box;
}
.b16 {
  position: relative;
  line-height: 25.47px;
}
.ctrldividerMargin {
  display: flex;
  align-items: flex-start;
  padding: 0px 16px;
}
.ctrldivider {
  height: 28px;
  width: 1px;
  position: relative;
  background-color: #dfe6e9;
}
.btncompress {
  height: 55.9px;
  box-shadow:
    0px 0.9989579916000366px 3px rgba(0, 0, 0, 0.04),
    0px 1.9979159832000732px 7.99px rgba(0, 0, 0, 0.04);
  border-radius: 15.98px;
  background-color: #fff;
  border: 1px solid #dfe6e9;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0px 20px;
  gap: 8px;
  font-size: 14.98px;
  color: #4a8a78;
}
.icocompressIcon {
  height: 20px;
  width: 20px;
  position: relative;
}
.text22 {
  height: 23px;
  width: 30px;
  position: relative;
}
.btnminimize {
  height: 55.9px;
  width: 55.9px;
  box-shadow:
    0px 0.9989579916000366px 3px rgba(0, 0, 0, 0.04),
    0px 1.9979159832000732px 7.99px rgba(0, 0, 0, 0.04);
  border-radius: 15.98px;
  background-color: #fafbfc;
  border: 1px solid #dfe6e9;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icominusIcon {
  height: 22px;
  width: 22px;
  position: relative;
}
.btnclose {
  height: 55.9px;
  width: 55.9px;
  box-shadow:
    0px 0.9989579916000366px 3px rgba(0, 0, 0, 0.04),
    0px 1.9979159832000732px 7.99px rgba(0, 0, 0, 0.04);
  border-radius: 15.98px;
  background-color: #fdf2f1;
  border: 1px solid #efc4be;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
