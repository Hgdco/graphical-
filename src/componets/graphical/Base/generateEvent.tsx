let SOURCE_NODE:any = []
const generateEvent = (
  graph: any, 
  setPopup: any, 
  setMsgState: any,
  addNodeState:boolean,
  setAddNodeState:any,
  setGraphData:any,
  setSelectNodeIndex:any,
  setNewNodePosition:any,
) => {
  const getInPorts = (cell: any)  => {
    return cell.getPortsByGroup('in')
  }

  const getOutPorts = (cell: any) => {
    return cell.getPortsByGroup('out')
  }
  const getUsedInPorts = (graph: any,cell: any) => {
    const incomingEdges = graph.getIncomingEdges(cell) || []
    const portIds:any = []
    incomingEdges.map((edge:any) => {
      const portId = edge.getTargetPortId()
      portIds.push(portId)
    })
    return portIds
  }
  const getUsedOutPorts = (graph:any,cell:any) => {
    const incomingEdges = graph.getOutgoingEdges(cell) || []
    const portIds:any = []
    incomingEdges.map((edge:any) => {
      const portId = edge.getSourcePortId()
      portIds.push(portId)
    })
    return portIds
  }
  const getNewInPorts = (length:number) => {
    return Array.from(
      {
        length,
      },
      () => {
          return {
            group: 'in',
        }
      },
    )
  }
  const getNewOutPorts = (length:number) => {
    return Array.from(
      {
        length,
      },
      () => {
          return {
            group: 'out',
        }
      },
    )
  }
  //新增链接桩
  function update(cell:any) {
    if(cell){
      const inPorts = getInPorts(cell)
      const usedPorts = getUsedInPorts(graph,cell)
      const newPorts = getNewInPorts(1)
      if (inPorts.length === usedPorts.length) {
        cell.addPorts(newPorts)
      }
    }
  }
  function updateOut(cell:any,type:string) {
    if(cell){
      const outPorts = getOutPorts(cell)
      const usedPorts = getUsedOutPorts(graph,cell)
      const newOutPorts = getNewOutPorts(1)
      if (outPorts.length === usedPorts.length || type == 'outUp') {
        cell.addPorts(newOutPorts)
      }
    }
  }
  //删除链接桩
  function updateOutDel(source:any) {
    const cell = graph.getCellById(source.cell)
    if(cell){
      cell.removePort(source.port)
    }
    
  }
  function updateDel(target:any) {
    const cell = graph.getCellById(target.cell)
    if(cell){
      cell.removePort(target.port)
    }
  }
 
  //添加边
  graph.on('edge:added', ({cell}:{cell:any,}) => {
    SOURCE_NODE = []
    SOURCE_NODE.push(cell.getSourceCell().id,getOutPorts(cell.getSourceCell())[getOutPorts(cell.getSourceCell()).length - 1].id,cell.getSourceCell())
  })
  //删除边
  graph.on('edge:removed', ({ edge, index }:{edge:any, index:number,}) => {
    //此处可获得新增节点的坐标edge.getTarget()
    
    if(edge.getTarget().cell){
      updateOutDel(edge.getSource())
      updateDel(edge.getTarget())
      localStorage.setItem('NODED_DATA',JSON.stringify(graph.toJSON()))
    }else{
      console.log(edge.getTarget())
      setNewNodePosition(edge.getTarget())
    }
    
  })
  
  graph.on('edge:connected', ({edge,isNew, previousView, currentView }:{edge:any,isNew:boolean,previousView:any,currentView:any,}) => {
    if (previousView) {
      update(previousView.cell)
    }
    if (currentView) {
      update(currentView.cell)
    }
    if (isNew) {
      updateOut(edge.getSourceCell(),'out')
    }
    localStorage.setItem('NODED_DATA',JSON.stringify(graph.toJSON()))
  })
  graph.on('edge:mouseenter', ({edge} : {edge:any}) => {
    edge.addTools([
      'source-arrowhead',
      'target-arrowhead',
      {
        name: 'button-remove',
        args: {
          distance: -30,
        },
      },
    ])
  })
  //判断边是否连接成功
  graph.on('edge:mouseleave', ({edge} : {edge:any}) => {
    edge.removeTools()
    localStorage.setItem('NODED_DATA',JSON.stringify(graph.toJSON()))
    if(edge._model == null){
      setPopup(true)
    }
  })
  //右键点击子节点
  graph.on('node:contextmenu', ({node} : {node:any}) => { 
    const nodes = graph.getNodes()
    nodes.forEach((item:any,index:number) =>{
        if(node.id == item.id){
          setSelectNodeIndex(item.id)
        }
    })
    setMsgState(true)
  })
  graph.on('node:moved', () => {
    localStorage.setItem('NODED_DATA',JSON.stringify(graph.toJSON()))
  })
  const updateEdge = () =>{
    const cells = graph.toJSON().cells
    let target:any = []
    cells.forEach((item:any,index:number) =>{
      if(item.shape == 'graph-node' || item.shape == 'graph-parent'){
        // if(index != 0){
        //   cells[0].children.push(item.id)
        // }
        target.push(item)
      }
    })
    
    graph.addEdge({
      source: { cell: SOURCE_NODE[0], port: SOURCE_NODE[1] },  // 源节点和链接桩 ID
      target: { cell: target[target.length - 1].id, port: target[target.length - 1].ports.items[0].id }, // 目标节点 ID 和链接桩 ID
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
    })
    updateOut(SOURCE_NODE[2],'outUp')
    setAddNodeState(false)
    const cellsEdge = JSON.parse(localStorage.getItem('NODED_DATA') as string).cells || []
    setGraphData({cells:[...cellsEdge]})
    localStorage.setItem('NODED_DATA',JSON.stringify(graph.toJSON()))
  }
  if(addNodeState){
    updateEdge()
  }
};
export default generateEvent;
