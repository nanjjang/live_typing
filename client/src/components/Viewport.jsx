import { useRef } from 'react'
import { useElementSize } from '../lib/hooks.js'
import PreviewFrame from './PreviewFrame.jsx'

/**
 * A white box holding the live render. Fills its box; when `vw` is given the
 * page is laid out at that width and scaled down to fit.
 *
 * Props: lesson, code, vw (number | null), overlay (onion-skin of the finished
 * code), onStatus, delay, device (draw a rounded device frame on graph paper),
 * className.
 */
export default function Viewport({ lesson, code, vw = null, overlay = false, onStatus, delay, device = false, className = '' }) {
  const box = useRef(null)
  const { width, height } = useElementSize(box)
  const border = device ? 2 : 0
  const w = Math.max(0, width - border)
  const h = Math.max(0, height - border)
  const scale = vw && w ? Math.min(1, w / vw) : 1
  const innerW = vw ? vw : w
  const innerH = h / scale
  const pageW = vw ? vw * scale + border : width
  return (
    <div className={`vp-box${device ? ' is-device' : ''} ${className}`}>
      <div className="vp-fit" ref={box}>
        <div className="vp" style={{ width: pageW || '100%', height: height || '100%' }}>
          <div
            className="vp-inner"
            style={{
              width: innerW || '100%',
              height: innerH || '100%',
              transform: scale < 1 ? `scale(${scale})` : undefined,
            }}
          >
            <PreviewFrame lesson={lesson} code={code} onStatus={onStatus} delay={delay} />
            {overlay && (
              <div className="onion" aria-hidden="true">
                <PreviewFrame lesson={lesson} code={lesson.code} delay={0} title="원본" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
