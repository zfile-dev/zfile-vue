import Vue from 'vue';

import {
    Dialog,
    Menu,
    MenuItem,
    Input,
    InputNumber,
    Switch,
    Option,
    Button,
    Select,
    Table,
    TableColumn,
    Breadcrumb,
    BreadcrumbItem,
    Form,
    FormItem,
    Tabs,
    TabPane,
    Icon,
    Row,
    Col,
    Card,
    Popover,
    Badge,
    Link,
    Radio,
    Divider,
    Tooltip,
    Loading,
    Message,
    MessageBox,
    Notification,
    Backtop,
    Popconfirm,
    Pagination,
    DatePicker
} from 'element-ui';

// 按需加载 ElementUI
Vue.use(Dialog);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Switch);
Vue.use(Select);
Vue.use(Option);
Vue.use(Button);
Vue.use(Table);
Vue.use(Divider);
Vue.use(TableColumn);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Icon);
Vue.use(Row);
Vue.use(Col);
Vue.use(Card);
Vue.use(Tooltip);
Vue.use(Popover);
Vue.use(Loading);
Vue.use(Badge);
Vue.use(Link);
Vue.use(Radio)
Vue.use(Backtop);
Vue.use(Popconfirm);
Vue.use(Pagination);
Vue.use(DatePicker);


Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;
