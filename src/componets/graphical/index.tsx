import type { FC } from 'react'
import { useRef, forwardRef, memo, useState, useEffect, useImperativeHandle, useMemo } from 'react'
import { Graph, Edge, Shape, NodeView, Addon } from '@antv/x6'

import registerNode from "./Base/registerNode";
import generateEvent from "./Base/generateEvent";
import MenuPopup from "./Base/menu/ChartPopup/Popup";
import MenuMsg from "./Base/menu/NodeMsg/Msg";

let selectProts:any = []
let textRender:number = 1

const GraphRender = (() =>{
    const NODED_DATA = JSON.parse(localStorage.getItem('NODED_DATA') as string) || {cells:[]}//初始化节点数据
    const refContainer = useRef(null);
    const [graph, setGraph] = useState<any>({});
    const [graphData,setGraphData] = useState<any>(NODED_DATA)
    const [popup,setPopup] = useState<boolean>(false)//新增节点弹窗
    const [msgState,setMsgState] = useState<boolean>(false)//右击节点弹窗
    const [addNodeState,setAddNodeState] = useState(false)//添加new节点状态
    const [selectNodeIndex,setSelectNodeIndex] = useState<string>(String)//点击节点的索引
    const [newNodePosition,setNewNodePosition] = useState<object>({})//点击节点的索引
    //渲染画布
    useEffect(() => {
        const graph = initGraph();
        return () => graph.dispose();
    }, [graphData.cells.length,textRender])
    //初始化画布
    const initGraph = () => {
        const graph = new Graph({
            container: refContainer.current!,
            grid: true,
            history: true, // 开启画布撤销功能
            mousewheel: {
                enabled: true, // 是否开启滚轮缩放交互
                zoomAtMousePosition: true, // 是否将鼠标位置作为中心缩放
                modifiers: "ctrl", // 同时按crtl和鼠标滚轮时才触发
                minScale: 0.5, // 最小倍数
                maxScale: 3, // 最大倍数
            },
            translating: { //限制节点移动范围
                restrict: true,
            },
            connecting: {
                // router: "manhattan", // 智能正交路由，由水平或垂直的正交线段组成，并自动避开路径上的其他节点
                router: {
                    name: 'er',
                    args: {
                        direction: 'V',
                    },
                },
                connector: {
                    name: "rounded", // 圆角连接器
                    args: {
                        radius: 20, // 半径
                    },
                },
                anchor: "center",
                connectionPoint: "anchor",
                allowBlank: false,
                allowLoop: false,
                highlight: true,
                snap: {
                    radius: 20,
                },
                createEdge() {
                    return new Shape.Edge({
                        attrs: {
                            line: {
                                stroke: "#A2B1C3",
                                strokeWidth: 2,
                                targetMarker: {
                                    name: "block",
                                    width: 12,
                                    height: 8,
                                },
                            },
                        },
                        zIndex: 0,
                        tools: [
                            { name: 'vertices' },
                            {
                                name: 'button-remove',  // 工具名称
                                args: { x: 10, y: 10 }, // 工具对应的参数
                            },
                        ],
                    });
                },
                validateMagnet({ magnet}) {
                    //判断链接桩链接后不可再链接
                    JSON.parse(localStorage.getItem('NODED_DATA') as string).cells.map((item:any) =>{
                        if(item.shape == 'edge'){
                          selectProts.push(item.source.port)
                          selectProts.push(item.target.port)
                        }
                    })
                    if(magnet){
                      if(selectProts.indexOf(magnet.getAttribute('port')) == -1){
                        return true
                      }
                    }
                    return false
                },
                validateConnection({ targetMagnet }) {
                    // 移动边时判断是否有效
                    if (!targetMagnet) {
                        return false
                    }
                    //不可连接到输出连接桩
                    if (targetMagnet.getAttribute('port-group') !== 'in') {
                        return false
                    }
                    return true
                },
            },
            highlighting: {
                // 高亮设置
                magnetAdsorbed: {
                    // 连线过程自动吸附设置
                    name: "stroke",
                    args: {
                        attrs: {
                            fill: "#5F95FF",
                            stroke: "#5F95FF",
                        },
                    },
                },
            },
            resizing: true, // 缩放
            rotating: true, // 旋转节点
            selecting: {
                // 点选/框选
                enabled: true,
                rubberband: true,
                showNodeSelectionBox: true,
            },
            snapline: true, // 对齐线
            keyboard: true,
            clipboard: true,
        });
        setGraph(graph);
        registerNode({
            graph,
            graphData,
        })//创建节点
        generateEvent(
            graph,
            setPopup,
            setMsgState,
            addNodeState,
            setAddNodeState,
            setGraphData,
            setSelectNodeIndex,
            setNewNodePosition,
        )//节点事件分离 
        graph.centerContent()   
        return graph;
    };

    //事件:关闭弹窗
    const closePopup = (e:any) =>{
        setPopup(false)
    }
    //事件:添加子节点
    const addNode = (e:any) =>{
        const cells = JSON.parse(localStorage.getItem('NODED_DATA') as string).cells || []
        setGraphData({cells:[...cells,{...newNodePosition,type:'new'}]})
        setAddNodeState(true)
        setPopup(false)
    }
    //事件:关闭节点属性弹框
    const closeMsg = (e:any) =>{
        setMsgState(false)
    }
    //事件:给节点添加属性
    const confirmAddMsg = (e:any,text:string | number) =>{
        const cells = JSON.parse(localStorage.getItem('NODED_DATA') as string).cells || []
        const cellsText:any = []
        cells.map((item:any) =>{
            if(item.id == selectNodeIndex){
               item.label = text
            }
            return cellsText.push(item)
        })
        setGraphData({cells:[...cellsText]})
        setMsgState(false)
        textRender += 1
    }
    return(
        <div>
            <div style={{width:'100%',minHeight: '100vh'}} ref={refContainer}></div>
            {
                popup ? <MenuPopup onClosePopup={closePopup} onConfirmAddNode={addNode}/> : null
            }
            {
                msgState ? <MenuMsg onCloseMsg={closeMsg} onConfirmAddMsg={confirmAddMsg}/> : null
            }
        </div>
        
    )
})

export default memo(GraphRender)
