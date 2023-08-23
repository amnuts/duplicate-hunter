import React from 'react';
import {PanelResizeHandle} from "react-resizable-panels";

import "./ResizeHandle.css";
import { EllipsisHorizontalIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export default function ResizeHandle({className = "", collapsed = false, id = "" })
{
    return (
        <PanelResizeHandle className={["ResizeHandleOuter", className].join(" ")} id={id}>
            <div className="ResizeHandleInner" data-collapsed={collapsed || undefined}>
                <EllipsisVerticalIcon className="HorizontalIcon" type="resize-horizontal"/>
                <EllipsisHorizontalIcon className="VerticalIcon" type="resize-vertical"/>
            </div>
        </PanelResizeHandle>
    )
}
