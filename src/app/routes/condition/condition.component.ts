import {Component, Input, OnInit} from '@angular/core';
import {format} from "date-fns";
import {DataFilter, DataSetFieldVo} from "../../interfaces/data-set-interface";
import {FormulaComponent} from "../formula/formula.component";
import {NzMessageService} from "ng-zorro-antd";
import {DataUtilService} from "../../core/data-util/data-util.service";

class DataSetDetailsVo {
}

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.less']
})
export class ConditionComponent implements OnInit {

  @Input() public selectDataSetList: DataSetDetailsVo[];

  @Input() public filterData: DataFilter = <DataFilter>{};

  @Input() public chartId: string;

  //只可添加条件,用于数据集权限
  @Input() public conditionOnly: boolean = false;

  public lessOperatorList = [
    { name: '<' },
    { name: '<=' },
  ];

  private pageSize: number = 10;

  public funList: any[];

  constructor(
    public dataUtil: DataUtilService,
    private http: HttpClientService,
    private msg: NzMessageService,
    private as: ArrayService,
  ) {
  }

  ngOnInit(): void {
    //单独处理文本类型的属于/不属于，使其下拉选项为选中的值，并把上一次选中的值设为当前选中的值。
    this.as.visitTree([this.filterData], (item: DataFilter) => {

      if (item.operator == 'INNER_GET' && item.selectField?.fieldType == 'STRING' && item.calcMethod?.inputType == 'select') {
        item.fieldValue = item.selectFieldValue.concat();
        item.lastSelectFieldValue = item.selectFieldValue.concat();
      }
    }, {
      childrenMapName: 'expression',
    });
  }

  /**
   * 当字符串为属于、不属于时，查询该字段的值
   * @param e
   * @param item
   */
  loadFieldValue(e, item: DataFilter) {
    this.selectCalcMethod(item, 'fieldStringCalcMethod');
  }

  /**
   * 新增过滤条件
   * @param operator
   * @param type
   */
  addFilterCondition(operator: string, type: 0 | 1) {
    if (!this.filterData || Object.keys(this.filterData).length == 0) {
      this.filterData = {
        'expressionString': '',
        'operator': 'INNER_GET',
        'type': type,
      };
      return;
    }

    if (this.filterData.operator === operator) {
      this.filterData.expression.push({
        'expressionString': '',
        'operator': 'INNER_GET',
        'type': type,
      });
    }

    if (this.filterData.operator !== operator) {
      this.filterData = {
        'operator': operator,
        expression: [this.filterData, {
          'expressionString': '',
          'operator': 'INNER_GET',
          'type': type,
        }],
      };
    }
  }

  /**
   * 点击选中字段
   * @param item
   * @param field
   * @param setId 表id
   */
  clickField(item: DataFilter, field: DataSetFieldVo, setId: number) {
    item.selectField = field;
    item.setId = setId;

    switch (field.fieldType) {
      case 'NUM':
        item.calcMethodKey = this.dataUtil.fieldNumCalcMethod[0].key;
        item.calcMethod = this.dataUtil.fieldNumCalcMethod[0];
        break;
      case 'STRING':
        item.calcMethodKey = this.dataUtil.fieldStringCalcMethod[0].key;
        item.calcMethod = this.dataUtil.fieldStringCalcMethod[0];
        break;
      case 'TIMESTAMP':
        item.calcMethodKey = this.dataUtil.fieldDateCalcMethod[0].key;
        item.calcMethod = this.dataUtil.fieldDateCalcMethod[0];
        break;
    }
  }

  /**
   * 切换方法
   * @param item
   * @param fieldCalcMethod
   */
  selectCalcMethod(item: DataFilter, fieldCalcMethod: string) {
    item.calcMethod = Object.assign(this.dataUtil[fieldCalcMethod].find(v => v.key == item.calcMethodKey));
  }

  /**
   * 搜索字段值
   * @param item
   * @param value
   */
  searchFieldValue(item: DataFilter, value: string) {
    this.queryFieldValue(item, 0, value);
  };

  /**
   * 加载更多字段的值
   * @param item
   */
  loadMoreFieldValue(item: DataFilter) {
    if (Math.ceil(item.allFieldLength / this.pageSize) <= item.pageNum) {
      return;
    }

    this.queryFieldValue(item, item.pageNum);
  }

  /**
   * 请求接口获取字段值
   * @param item
   * @param pageNum
   * @param fieldValue 搜索的值
   */
  queryFieldValue(item: DataFilter, pageNum: number, fieldValue: string = '') {

    item.isLoading = true;

    this.http.post('/api/dataSet/pageQueryDataSetFieldValue', {
      fieldId: item.selectField.id,
      fieldValue: fieldValue,
      pageNum: 1 + pageNum,
      pageSize: this.pageSize,
    }, res => {

      item.isLoading = false;

      let fieldOptionList;
      //todo 待改完再测下 如果上一次选中的值，则本次请求结果去除值
      if (!item.lastSelectFieldValue || item.lastSelectFieldValue.length == 0) {
        fieldOptionList = res.data.dataList ? res.data.dataList : [];
        if (pageNum == 0) {
          item.fieldValue = fieldOptionList;
          item.allFieldLength = res.data.total;
          item.pageNum = 1;

          return;
        }
      } else {
        fieldOptionList = res.data.dataList.filter(v => item.lastSelectFieldValue.indexOf(v) == -1);
      }

      item.fieldValue = item.fieldValue.concat(fieldOptionList);
      item.allFieldLength = res.data.total;
      item.pageNum = 1 + pageNum;

    });
  }

  /**
   * 关闭公式，公示内容更新为原先的内容。
   * @param item
   * @param hcEditFormula
   */
  closeFormula(item: DataFilter, hcEditFormula: FormulaComponent) {
    item.dropDownVisible = false;

    item.code = item.expressionString;
    setTimeout(() => {
      hcEditFormula.converseCodeToShow();
    }, 100);

  }

  /**
   * 保存公式
   * @param item
   */
  saveFormula(item: DataFilter) {
    item.expressionString = item.code;
    //把code翻译为codeShowValue
    item.codeShowValue = this.converseCustomDataCodeToShow(item.code);

    item.dropDownVisible = false;
  }

  /**
   * 自助数据集：转换code为可展示的内容
   * @param code
   */
  converseCustomDataCodeToShow(code: string): string {
    let codeRegExpMatchArray = code.match(/\$\d+\#\d+\$/g);
    if (!codeRegExpMatchArray) {
      return code;
    }

    codeRegExpMatchArray.forEach(item => {
      let ids = item.match(/\d+/g);
      this.selectDataSetList.forEach(v => {
        if (v.setId == parseInt(ids[0])) {
          v.fieldsList.forEach(f => {
            if (f.id == parseInt(ids[1])) {
              code = code.replace(item, f.fieldName);
            }
          });
        }
      });
    });

    return code;
  }

  /**
   * 删除过滤条件
   * @param i
   * @param item
   */
  deleteFilter(i: number, item: DataFilter) {
    //只剩自己，item为自己
    if (i == -1) {
      for (let x in item) {
        delete item[x];
      }
      return;
    }

    //item为父级
    item.expression.splice(i, 1);

    // 如果表达式只剩一个，则把父级一层替换。且当剩余表达式不为inner_get时，后台能解析。
    if (item.expression.length == 1) {
      let newDataFilter = Object.assign(item.expression[0]);
      for (let x in item) {
        delete item[x];
      }
      for (let x in newDataFilter) {
        item[x] = newDataFilter[x];
      }
    }
  }

  /**
   * 校验过滤数据，并组装最终公式
   * @param data
   */
  private checkFilterData(data: DataFilter) {
    if (data.operator == 'INNER_GET') {

      //公式不校验
      if (data.type == 1) {
        return true;
      }

      //校验是否选了字段
      if (!data.selectField) {
        return false;
      }

      let v1 = data.calcMethod.v1;
      let v2 = data.calcMethod.v2;
      // 校验string类型且为inputType为select时
      if (data.calcMethod.inputType == 'select') {
        // if (data.allChecked) {
        //   data.expressionString = 'true';
        //   return true;
        // }
        // let checkedFieldList = data.fieldValue.filter(item => item.checked);
        let checkedFieldList = data.selectFieldValue;
        if (checkedFieldList.length == 0) {
          return false;
        }

        let selectValue: Array<string> = [];
        checkedFieldList.forEach(v => {
          selectValue.push('\'' + v + '\'');
        });

        v1 = selectValue.join(',');

      }

      //校验$1值
      if (v1 == null || v1 === '') {
        return false;
      }

      //校验$2值
      if (data.calcMethod.inputSize == 2) {
        if (v2 == null || v2 === '') {
          return false;
        }
      }

      let formula = data.calcMethod.formula;

      if (data.selectField.fieldType === 'TIMESTAMP') {
        v1 = format(v1, 'yyyy-MM-dd HH:mm:ss');
        if (data.calcMethod.inputSize == 2) {
          v2 = format(v2, 'yyyy-MM-dd HH:mm:ss');
        }
      }

      // 数字类型
      if (data.selectField.fieldType === 'NUM') {
        formula = formula
          .replace('[o1]', data.calcMethod.operator1)
          .replace('[o2]', data.calcMethod.operator2);
      }

      // 统一处理
      data.expressionString = formula
        .replace(/&&&&/g, '$' + data.setId + '#' + data.selectField.id + '$')
        .replace('v1', v1)
        .replace('v2', v2);

      return true;

    } else if (data.operator == 'AND' || data.operator == 'OR') {
      return data.expression.every(item => this.checkFilterData(item));
    }

  }

  public checkValidity(allowEmpty: boolean = true): boolean {
    //判断是否为空
    if (!this.filterData || Object.keys(this.filterData).length == 0) {
      if (!allowEmpty) {
        this.msg.info('过滤信息不能为空！');
        return false;
      } else {
        return true;
      }
    }

    //不为空情况下，判断格式
    const checkFilterDataRes = this.checkFilterData(this.filterData);
    if (!checkFilterDataRes) {
      this.msg.info('请填写完整的过滤信息！');
      return false;
    }

    return true;
  }


}
