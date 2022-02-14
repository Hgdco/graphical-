import { Graph } from "@antv/x6";
export const group = {
    in: {
        position: {
            name: 'top',
        },
        attrs: {
            portBody: {
                magnet: 'passive',
                r: 6,
                stroke: 'red',
                fill: '#fff',
                strokeWidth: 2,
            },
        },
    },
    out: {
        position: {
            name: 'bottom',
        },
        attrs: {
            portBody: {
                magnet: true,
                r: 6,
                fill: '#fff',
                stroke: '#3199FF',
                strokeWidth: 2,
            },
        },
    },
}
//定义链接桩
export const parentPorts = {
    items: [
        { group: 'out', },
    ],
    groups: {...group}
};
//定义链接桩
export const ports = {
    items: [
        { group: 'in', },
        { group: 'in', },
        { group: 'out', },
    ],
    groups: {...group}
};
// #region 初始化图形
Graph.registerNode(
    'graph-node',
    {
        inherit: 'rect',
        attrs: {
            body: {
                strokeWidth: 1,
                stroke: '#108ee9',
                fill: '#fff',
                rx: 15,
                ry: 15,
            },
        },
        ports: { ...ports },
        portMarkup: [
            {
                tagName: 'circle',
                selector: 'portBody',
            },
        ],
    },
    true,
)
// #region 初始化图形
Graph.registerNode(
    'graph-parent',
    {
        inherit: 'rect',
        attrs: {
            body: {
                strokeWidth: 1,
                stroke: '#108ee9',
                fill: '#fff',
                rx: 15,
                ry: 15,
            },
        },
        ports: { ...parentPorts },
        portMarkup: [
            {
                tagName: 'circle',
                selector: 'portBody',
            },
        ],
    },
    true,
)
interface NodeRenderProps {
    graph?: any;
    graphData?: any;
}

let ADD_NODE_DATA: any[] = []
let childrenId: any[]  = []//添加新建nodeid为子组件
const registerNode = (defaultData: NodeRenderProps): any =>{
    ADD_NODE_DATA = []
    childrenId = []
    const {graph, graphData, } = defaultData
    const cells = graphData.cells || []
    if(cells.length == 0){//判断有无数据，没有数据则创建一条父级node
        const node = {
            x:1,
            y:20,
            width: 160,
            height: 30,
            zIndex: 1,
            shape: 'graph-parent',
            label: 'Parent',
        }
        ADD_NODE_DATA.push(node)
    }
    if(cells.length > 0){
        let graphNodeIndex:any = []
        cells.map((item:any,index:number) =>{
            //有新增子节点创建新的子节点
            if(item.shape == 'graph-node' || item.shape == 'graph-parent'){
                childrenId.push(item.id)
                graphNodeIndex.push(index)
            }
            if(item.type == 'new'){
                const newNode = JSON.stringify({
                    x:item.x || 1,
                    y:item.y || graphNodeIndex.length * 30 + 50,
                    width: 160,
                    height: 30,
                    shape: 'graph-node',
                    zIndex: 10,
                    label: 'subset',
                    id: (index + 1).toString()
                })
                item = JSON.parse(newNode)
                childrenId.push(item.id)
            }
            if(index == graphNodeIndex[0]){
                childrenId.concat(childrenId.splice(0,1))
                item.children = childrenId
            }
            return ADD_NODE_DATA.push(item)
        })
    }
    graph.fromJSON({cells:ADD_NODE_DATA})
    localStorage.setItem('NODED_DATA',JSON.stringify(graph.toJSON()))
    
}
export default registerNode;