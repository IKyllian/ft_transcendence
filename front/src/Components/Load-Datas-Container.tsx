import { ReactNode } from "react";

import LoadingSpin from "./Loading-Spin"

interface Props {
    children?: ReactNode,
    datas: any | boolean | undefined,
    containerClass: string,
}

function LoadDatasContainer(props: Props) {
    const {children, datas, containerClass} = props;
    return (datas === undefined || datas === true)? (
        <div className={containerClass}>
            <LoadingSpin />
        </div>
    ) : <>(
        {children}
    )</>
}

export default LoadDatasContainer;