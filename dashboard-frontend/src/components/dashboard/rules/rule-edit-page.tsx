/**
 * 通用规则编辑页面组件
 * 提取所有规则编辑页面的通用逻辑
 */

import { Box, Skeleton, Stack, Text } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { useOpenedInNewTab } from '@/hooks/use-opened-in-new-tab';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';

export interface RuleEditPageProps<TRule> {
  /** 规则类型名称（用于页面标题） */
  ruleTypeName: string;
  /** 规则表单组件 */
  FormComponent: React.ComponentType<{
    app: string;
    initialData?: TRule;
    onSubmit: (data: Omit<TRule, 'id'>) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    backPath: string;
  }>;
  /** 获取规则列表的 query hook */
  useRulesQuery: (app: string) => {
    data: TRule[] | undefined;
    isLoading: boolean;
  };
  /** 更新规则的 mutation hook */
  useUpdateMutation: () => {
    mutateAsync: (data: TRule) => Promise<TRule>;
    isPending: boolean;
  };
  /** 获取返回路径的函数 */
  getBackPath: (app: string) => string;
}

/**
 * 通用规则编辑页面
 * 处理新标签页打开、规则查找、自动关闭等通用逻辑
 */
export function RuleEditPage<TRule extends { id: number }>({
  ruleTypeName,
  FormComponent,
  useRulesQuery,
  useUpdateMutation,
  getBackPath,
}: RuleEditPageProps<TRule>): React.JSX.Element {
  const { app, id } = useParams<{ app: string; id: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading } = useRulesQuery(app ?? '');
  const updateRule = useUpdateMutation();
  const { isOpenedInNewTab, closeTab } = useOpenedInNewTab();
  const { user, isLoading: isUserLoading } = useUser();

  // 页面加载时立即检查登录状态
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      // 未登录，保存当前路径后跳转到登录页
      const returnUrl = window.location.pathname + window.location.search;
      navigate(`${paths.auth.custom.signIn}?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [user, isUserLoading, navigate]);

  const rule = React.useMemo(() => {
    if (!rules || !id) return undefined;
    return rules.find((r) => String(r.id) === id);
  }, [rules, id]);

  const handleSubmit = async (data: Omit<TRule, 'id'>) => {
    if (!rule) return;
    await updateRule.mutateAsync({ ...data, id: rule.id } as TRule);

    if (isOpenedInNewTab) {
      // 如果是在新标签页打开的，保存成功后自动关闭标签页
      closeTab();
    } else {
      // 否则跳转回列表页
      navigate(getBackPath(app!));
    }
  };

  const handleCancel = () => {
    // 取消操作也需要关闭新标签页或返回
    closeTab();
  };

  // 正在检查登录状态，显示加载中
  if (isUserLoading) {
    return <></>;
  }

  // 未登录会在 useEffect 中跳转，这里返回空避免闪烁
  if (!user) {
    return <></>;
  }

  if (!app || !id) {
    return <Box p={6}>参数错误</Box>;
  }

  if (isLoading) {
    return (
      <Box p={6}>
        <Stack gap={4}>
          <Skeleton height="40px" />
          <Skeleton height="200px" />
        </Stack>
      </Box>
    );
  }

  if (!rule) {
    return (
      <Box p={6}>
        <Text color="red.500">规则不存在</Text>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          编辑{ruleTypeName} - {app} | Sentinel Dashboard
        </title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <FormComponent
            app={app}
            initialData={rule}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateRule.isPending}
            backPath={getBackPath(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
