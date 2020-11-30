export interface DataPackageTreeList {
  packageId?: number
  packageName: string
  parentId?: number
  children?: DataPackageTreeList[]
  createTime?: string
  updateTime?: string
  isEdit?: boolean,
  packageIsManageRight?: boolean,
}

export interface DataSetVo {
  packageId: number
  setId: number
  setType: number
  status: number
  tableCode: string
  tableName: string
  tableStorageCode: string,
  disabled?: boolean,
  isManageRight?: boolean,//是否有管理权限
  creator?: number,//创建人id
}

export interface DataSetFieldVo {
  fieldName: string,
  fieldNull: number,
  fieldType: string,
  id: number,
  preUploadFieldName: string,
  fieldCode?: string,//新加code值
  disabled?: boolean,//不可用字段
  checked?: boolean,//已选字段
  isAddField?: boolean,//新增字段
  expression?:string,//表达式
  sourceTableDes?: string,//来源表描述
}

export interface SimpleTypeList {
  key: number,
  des: string,
}

export interface TimeUnitList {
  value: number,
  name: string,
  ms: number,
}

export interface DataSetDetailsVo extends DataSetVo {
  fieldsList: DataSetFieldVo[],
  visible?: boolean,//下拉框是否可见
  allChecked?: boolean,//全选
}

export interface DataFilter {
  operator: string,
  expression?: DataFilter[],
  expressionString?: string,
  type?: 0 | 1,// 0 字段条件  1 公式条件
  selectField?: DataSetFieldVo,//选中表字段
  setId?: number, //选中表字段的所属表id
  calcMethodKey?: string,//计算方法的key
  calcMethod?: CalcMethod,//计算方法
  //以下是STRING类型字段，且计算方法为属于、不属于专属
  isLoading?: boolean,//分页loading
  // fieldValue?: { value: string, isHide: boolean }[],//字段的值的list
  fieldValue?: string[],///字段的值的list
  selectFieldValue?: string[],//选中的字段的值
  lastSelectFieldValue?: string[],//上一次选中的字段的值，为了编辑时获取下拉字段
  allFieldLength?: number, //字段的长度
  pageNum?: number, //分页数
  //以下是公式的专属
  dropDownVisible?: boolean,//下拉框可见性
  code?: string,//codemirror的值
  codeShowValue?: string,//codemirror在input上展示的值
  codeValidity?: boolean,//code值有效性
}

export interface CalcMethod {
  key: string,
  name: string,
  inputSize: 1 | 2,
  formula: string,
  operator1?: string,
  operator2?: string,
  inputType?: string,//STRING类型字段，且计算方法为属于、不属于专属
  v1?: any,
  v2?: any,
}

export interface SimpleDataSetFieldVo {
  fieldName: string,
  fieldType: string,
  id: number,
}

export interface DataSetIndexVo {
  id?: number,
  indexUnique: boolean,
  indexName: string,
  setId: number,
  fields: SimpleDataSetFieldVo[],
  createTime?: string,
  updateTime?: string,
  planTime?: string,
  completeTime?: string,
  status?: number,//状态（0：已创建，1：待创建，2：正在创建）
}
