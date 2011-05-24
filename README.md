# Active, a user active loging and total service. 用户活跃跟踪统计系统

## 特性

* 自定义API

## 自定义API举例

活跃API: /active?uid=$uid&account_count=$account_count

参数名对应表:

<table>
    <tr>
        <th>key</th>
        <th>默认值</th>
        <th>含义</th>
        <th>描述</th>
    </tr>
    <tr>
        <td>uid</td>
        <td>用户唯一id</td>
        <td>标示唯一用户，可以根据此id判断独立用户总数</td>
    </tr>
</table>

