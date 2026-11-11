import { useRef } from 'react'
import { useElementSize } from '../../lib/hooks.js'
import PreviewFrame from '../PreviewFrame.jsx'

/**
 * Fills its box with a sandboxed render of `code`. With `vw`, the page is laid
 * out at that width and scaled down to fit (thumbnails, product stage).
 */
export default function LivePreview({ lesson, code, vw = null, delay, title = '미리보기', className = '' }) {
  const box = useRef(null)
  const { width, height } = useElementSize(box)
  const scale = vw && width ? width / vw : 1
  const style = vw
    ? { width: vw, height: scale ? height / scale : '100%', transform: `scale(${scale})` }
    : undefined
  return (
    <div className={`lp ${className}`} ref={box}>
      <div className="lp-inner" style={style}>
        {(!vw || width > 0) && <PreviewFrame lesson={lesson} code={code} delay={delay} title={title} />}
      </div>
    </div>
  )
}
