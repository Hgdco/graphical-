import { useState } from 'react'
import './Msg.css'

const Msg = (props:any) => {
    const { onCloseMsg, onConfirmAddMsg } = props
    const [inputValueName,setInputValueName] = useState('')
    //关闭弹窗
    const closeMsg = (e:any) => {
        onCloseMsg(e)
    }
    //添加子节点
    const confirmAddMsg = (e:any) => {
        onConfirmAddMsg(e,inputValueName)
    }
    const onchangeInput = (e:any) => {
        setInputValueName(e.target.value)
    }
    return (
        <div className='msg'>
            <div className='msg-item'>
                <div className='item-name'>name: </div>
                <input onChange={onchangeInput} />
            </div>
            <div className='msg-but-div'>
                <div className='msg-but-confirm msg-but' onClick={confirmAddMsg}>确认</div>
                <div className='msg-but-cancel msg-but' onClick={closeMsg}>取消</div>
            </div>
        </div>
    )
}

export default Msg