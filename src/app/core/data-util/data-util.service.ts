import { Injectable } from '@angular/core';
import {CalcMethod} from "../../interfaces/data-set-interface";

@Injectable({
  providedIn: 'root'
})
export class DataUtilService {

  /**
   * 字段类型与本文以及icon
   */
  public fieldTypeList = [
    { key: 1, des: '文本', type: 'STRING', icon: 'icontext'},
    { key: 2, des: '数值', type: 'NUM', icon: 'iconnumber'},
    { key: 3, des: '日期', type: 'TIMESTAMP', icon: 'icondate'},
  ]

  /**
   * 表关联关系
   */
  public relationList = [
    { name: '1 : 1', value: '1-1'},
    { name: '1 : N', value: '1-N'},
    { name: 'N : 1', value: 'N-1'},
  ]

  // 0-数据库表，1-sql数据集，2-excel数据集，3-自助数据集(
  public dataSetTypeList = [
    { key: 1, name: '自助数据集', url: 'data/create-data-set/custom', setType: 3, icon: 'iconchart_line_up'},
    // { key: 2, name: '服务器文件数据集', url: '', setType: null, icon: ''},
    { key: 3, name: '本地文件数据集', url: 'data/create-data-set/file', setType: 2, icon: 'iconMicrosoft-Excel'},
    { key: 4, name: '数据库数据集', url: 'data/create-data-set/db', setType: 0, icon: 'iconyunshujuku'},
    { key: 5, name: 'SQL数据集', url: 'data/create-data-set/sql', setType: 1, icon: 'iconsql'},
    // { key: 6, name: 'API数据集', url: '', setType: null, icon: ''},
  ];

  //数字类型字段的计算方法
  public fieldNumCalcMethod: CalcMethod[] = [
    { key: 'between', name: '介于', inputSize: 2, formula: 'bi_and(v1[o1]&&&&,&&&&[o2]v2)', operator1: '<', operator2:'<'},
    { key: 'notBetween', name: '不介于', inputSize: 2, formula: 'bi_or(&&&&[o1]v1,v2[o2]&&&&)', operator1: '<', operator2:'<'},
    { key: 'equal', name: '等于', inputSize: 1, formula: '&&&&=v1'},
    { key: 'notEqual', name: '不等于', inputSize: 1, formula: '&&&&!=v1'},
    { key: 'greater', name: '大于', inputSize: 1, formula: '&&&&>v1'},
    { key: 'less', name: '小于', inputSize: 1, formula: '&&&&<v1'},
    { key: 'greaterOrEqual', name: '大于等于', inputSize: 1, formula: '&&&&>=v1'},
    { key: 'lessOrEqual', name: '小于等于', inputSize: 1, formula: '&&&&<=v1'},
  ];

  //文本类型字段的计算方法
  public fieldStringCalcMethod: CalcMethod[] = [
    { key: 'equal', name: '等于', inputSize: 1, formula: "&&&& = 'v1'"},
    { key: 'notEqual', name: '不等于', inputSize: 1, formula: "&&&& != 'v1'"},
    { key: 'like', name: '包含', inputSize: 1, formula: "&&&& like '%v1%'"},
    { key: 'notLike', name: '不包含', inputSize: 1, formula: "&&&& not like '%v1%'"},
    { key: 'in', name: '属于', inputSize: 1, inputType: 'select', formula: 'bi_in(&&&&,v1)'},
    { key: 'notIn', name: '不属于', inputSize: 1, inputType: 'select', formula: 'bi_not_in(&&&&,v1)'},
    { key: 'begin', name: '开头是', inputSize: 1, formula: "&&&& like 'v1%'"},
    { key: 'notBegin', name: '开头不是', inputSize: 1, formula: "&&&& NOT like 'v1%'"},
    { key: 'end', name: '结尾是', inputSize: 1, formula: "&&&& like '%v1'"},
    { key: 'notEnd', name: '结尾不是', inputSize: 1, formula: "&&&& NOT like '%v1'"},
  ];

  //日期类型字段的计算方法
  public fieldDateCalcMethod: CalcMethod[] = [
    { key: 'between', name: '属于', inputSize: 2, formula: "bi_and('v1'<=&&&&,&&&&<='v2')"},
    { key: 'notBetween', name: '不属于', inputSize: 2, formula: "bi_or('v1'>&&&&,&&&&>'v2')"},
    { key: 'less', name: '某个日期之前', inputSize: 1, formula: "&&&&<'v1'"},
    { key: 'greater', name: '某个日期之后', inputSize: 1, formula: "&&&&>'v1'"},
    { key: 'equal', name: '等于', inputSize: 1, formula: "&&&&='v1'"},
    { key: 'notEqual', name: '不等于', inputSize: 1, formula: "&&&&!='v1'"},
  ];

  constructor(
  ) {

  }

}
