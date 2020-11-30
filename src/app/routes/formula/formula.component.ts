import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NzTreeNode, NzTreeNodeOptions} from "ng-zorro-antd";
import {debounceTime} from "rxjs/operators";
import * as CodeMirror from 'codemirror';
import {Subject} from "rxjs";

@Component({
  selector: 'app-formula',
  templateUrl: './formula.component.html',
  styleUrls: ['./formula.component.less']
})
export class FormulaComponent implements OnInit, OnDestroy {

  //函数列表
  funList: any[] = null;

  //公式
  code: string = '';

  //公式有效性
  @Input('codeValidity') codeValidity: boolean = false;

  @Output() private codeChange: EventEmitter<any> = new EventEmitter<any>();

  @Output() private codeValidityChange: EventEmitter<any> = new EventEmitter<any>();

  @Output() private funListChange: EventEmitter<any> = new EventEmitter<any>();

  @Input('selectDataSetList') selectDataSetList: any[] = [];

  public fieldNodes: NzTreeNodeOptions[] = [];

  @ViewChild('codemirrorRef') codemirrorRef;

  public funNodes: NzTreeNodeOptions[] = [];

  // codemirror组件的配置项
  public cmOptions: any = {
    lineNumbers: false, // 显示行号
    styleActiveLine: true, // 当前行背景高亮
    lineWrapping: true, // 自动换行
    mode: {name: 'fun-mode'}, // 定义mode
    autofocus: true,
    placeholder: '示例：a+b',
    extraKeys: {
      'Ctrl': 'autocomplete', // 提示快捷键
      Tab: function (cm) {
        const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
        cm.replaceSelection(spaces);
      },
    },
  };

  //操作符列表
  public operatorList: string[] = ['+', '-', '*', '/', '(', ')'];

  //不合法公式的提示
  public errorFormulaTip: string = '';

  private $checkExpression = new Subject<string>();

  constructor(
    private http: HttpClientService,//自己封装的，此处暂不上传，因为用到了ng-alain
  ) {
  }

  ngOnInit(): void {
    //格式转换为nodes
    this.fieldNodes = this.selectDataSetList.map(item => {
      return {
        ...item,
        title: item.tableName,
        key: item.setId,
        selectable: false,
        children: item.fieldsList.map(item2 => {
          return {
            fieldType: item2.fieldType,
            title: item2.fieldName,
            key: item2.id,
            isLeaf: true,
          };
        }),
      };
    });

    //如果传入的函数列表为null，则获取函数列表
    if (!this.funList) {
      this.getFuncList();
    } else {
      setTimeout(res => {
        this.dealFunListData(this.funList);
      }, 100);
    }

    // 订阅搜索功能
    this.$checkExpression.pipe(
      debounceTime(1000), // 等待用户停止输入1000ms
    ).subscribe(res => {
      this.expressionCheck();
    });


    setTimeout(res => {

      //监听codemirror粘贴
      this.codemirrorRef.instance.on('inputRead', (cm, event) => {
        if (event.origin == 'paste') {
          let text = event.text[0]; // pasted string
          this.stringToMarkText(text, event.from.line, event.from.ch);
        }
      });
    }, 100);
  }

  /**
   * 字符串转为markText
   * @param text
   * @param fromLine
   * @param fromCh
   */
  stringToMarkText(text: string, fromLine: number = 0, fromCh: number = 0) {
    let codeRegExpMatchArray = text.match(/\$\d+\#\d+\$/g);
    if (!codeRegExpMatchArray) {
      return;
    }

    //去重
    codeRegExpMatchArray = Array.from(new Set(codeRegExpMatchArray));
    codeRegExpMatchArray.forEach(item => {
      let ids = item.match(/\d+/g);
      this.selectDataSetList.forEach(v => {
        if (v.setId == parseInt(ids[0])) {
          v.fieldsList.forEach(f => {
            if (f.id == parseInt(ids[1])) {
              let index = 0;//开始查询的位置
              while ((index = text.indexOf(item, index)) != -1) {	//从角标index开始向后查询,如果角标是-1，则表示查询结束
                //生成新的标签
                this.generateMarkText(f.fieldName,
                  {line: fromLine, ch: fromCh + index},
                  {line: fromLine, ch: fromCh + index + item.length});

                index += item.length;
              }
            }
          });
        }
      });
    });
  }

  /**
   * 生成markText
   * @param from
   * @param to
   * @param showText
   */
  generateMarkText(showText: string, from: { line, ch }, to: { line, ch }) {
    let divTag = document.createElement('span');
    divTag.innerText = showText;
    divTag.setAttribute('class', 'fieldName');

    let doc = this.codemirrorRef.instance.doc;
    doc.markText(from, to, {
      atomic: true,
      selectRight: true,
      clearOnEnter: false,
      replacedWith: divTag,
    });
  }

  /**
   * 转换code显示到areaText上
   */
  converseCodeToShow() {
    if (!this.code) {
      return;
    }

    this.stringToMarkText(this.code);

    //设置焦点
    let cm = this.codemirrorRef.instance;
    cm.focus();
  }

  /**
   * 查询函数列表
   */
  getFuncList() {
    this.http.post('', null, res => {
      this.funListChange.emit(res.data);
      this.dealFunListData(res.data);
    });
  }

  /**
   * 处理函数列表数据
   * @param data
   */
  dealFunListData(data) {
    let funcType;
    let parentArr = [];
    let childrenArr = [];
    data.forEach((item, index) => {
      if (item.funcType == funcType) {
        childrenArr.push({
          ...item,
          key: item.id,
          title: item.func,
          isLeaf: true,
        });
      } else {

        if (index == 0) {
          funcType = item.funcType;
          childrenArr.push({
            ...item,
            key: item.id,
            title: item.func,
            isLeaf: true,
          });
          return;
        }

        parentArr.push({
          key: funcType,
          title: funcType,
          children: childrenArr,
          selectable: false,
        });

        funcType = item.funcType;

        childrenArr = [{
          ...item,
          key: item.id,
          title: item.func,
          isLeaf: true,
        }];
      }
    });
    parentArr.push({
      key: funcType,
      title: funcType,
      children: childrenArr,
      selectable: false,
    });
    this.funNodes = parentArr;

    // 初始化函数编辑框的mode模式
    this.initCodemirrorMode(data);
  }

  /**
   * 初始化codemirror的mode模式
   * 目的是为了高亮自定义函数
   * @param data
   */
  initCodemirrorMode(data) {

    let funList = data.map(item => {
      return item.func;
    });
    let funStrings = funList.join('|');
    const funRegex = '/(?:' + funStrings + ')\\b/';
    CodeMirror.defineSimpleMode('fun-mode', {
      start: [
        {regex: eval(funRegex), token: 'keyword'},
        {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: 'string'},
        {regex: /true|false|null|undefined/, token: 'atom'},
        {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: 'number'},
        {regex: /[-+\/*=<>!]+/, token: 'operator'},
        {regex: /[\{\[\(]/, indent: true},
        {regex: /[\}\]\)]/, dedent: true},
      ],
    });
    let cm = this.codemirrorRef.instance;
    cm.setOption('mode', 'fun-mode');

    setTimeout(() => {
      this.converseCodeToShow();
    }, 100);
  }

  /**
   * 点击字段节点
   * @param node
   */
  clickFieldNode(node: NzTreeNode) {
    const fieldName = node.title;

    let cm = this.codemirrorRef.instance;

    //获取焦点位置
    let pos = cm.getCursor();

    //前后端交互的格式
    let assembledField = '$' + node.parentNode.key + '#' + node.key + '$';

    //插入数据
    cm.replaceRange(assembledField, pos, pos);

    //此处插入值，并标记
    this.generateMarkText(fieldName,
      {line: pos.line, ch: pos.ch},
      {line: pos.line, ch: pos.ch + assembledField.length},
    );

    //设置焦点
    cm.focus();
  }

  /**
   * 点击函数
   * @param node
   */
  clickFun(node: NzTreeNode) {
    this.insertFormulaText(node.title + '()', node.title.length + 1);
  }

  /**
   * 点击操作符
   * @param operator
   */
  clickOperator(operator: string) {
    this.insertFormulaText(operator, operator.length);
  }

  /**
   * 插入公式文本
   * @param text
   * @param len
   */
  insertFormulaText(text, len: number) {
    let cm = this.codemirrorRef.instance;

    //获取焦点位置
    let pos = cm.getCursor();

    //插入数据
    cm.replaceRange(text, pos, pos);

    //更改焦点位置
    cm.setCursor({line: pos.line, ch: pos.ch + len});

    //设置焦点
    cm.focus();
  }

  /**
   * 公式变更
   */
  changeFormula() {
    this.codeChange.emit(this.code);

    this.codeValidity = false;
    this.errorFormulaTip = '';
    this.codeValidityChange.emit(this.codeValidity);

    this.$checkExpression.next();
  }

  /**
   * 检查表达式
   */
  expressionCheck() {
    this.http.post('/api/diyDataSet/expressionCheck', {
      expression: this.code,
    }, res => {
      this.errorFormulaTip = '公式合法';
      this.codeValidity = true;
      this.codeValidityChange.emit(this.codeValidity);

    }, null, res => {
      this.errorFormulaTip = res.message;
    });
  }

  ngOnDestroy(): void {
    this.$checkExpression.unsubscribe();
  }
}
